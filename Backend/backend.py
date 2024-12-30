from ortools.sat.python import cp_model
import json
import data
import argparse
import importlib.util


SCHOOL_HOUR = data.SCHOOL_HOUR  # [min]
parser = argparse.ArgumentParser()
parser.add_argument('-d', '--data', required=True, help='Path to the data file')
args = parser.parse_args()
spec = importlib.util.spec_from_file_location("data", args.data)
data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(data)


class SchoolSchedulingProblem:
    """Dataloader class reading the input data."""

    def __init__(
        self,
        levels,
        subjects,
        curriculum,
        teachers,
        preferred_teachers,
        preferred_teachers_time_slots,
        specialties,
        time_slots,
        location_room,
    ):
        self._levels = levels
        self._subjects = subjects
        self._curriculum = curriculum

        for lvl, sub in self._curriculum.keys():
            assert lvl in self._levels, f"{lvl} not in LEVELS"
            assert sub in self._subjects, f"{sub} not in SUBJECTS"

        self._teachers = teachers
        self._preferred_teachers = preferred_teachers
        self._preferred_teachers_ts = preferred_teachers_time_slots
        self._specialties = specialties

        for s in self._subjects:
            assert s in self._specialties, f"{s} is not in SPECIALITIES"
        for s, ts in self._specialties.items():
            assert s in self._subjects, f"{s} is not in SUBJECTS"
            for t in ts:
                assert t in self._teachers, f"{t} is not in TEACHERS"

        self._time_slots = time_slots
        self._location_room = location_room

    @property
    def levels(self):
        return self._levels

    def level_idx(self, level):
        return self._levels.index(level)

    @property
    def subjects(self):
        return self._subjects

    def subject_idx(self, subject):
        return self._subjects.index(subject)

    @property
    def curriculum(self):
        return self._curriculum

    def curriculum_contains(self, level, subject):
        if (level, subject) in self._curriculum:
            return True
        else:
            return False

    def curriculum_time_request(self, level, subject):
        assert (
            level,
            subject,
        ) in self._curriculum, f"level/subject: '{level}'/'{subject}' not in CURRICULUM"
        return self._curriculum[level, subject]

    @property
    def teachers(self):
        return self._teachers

    def teacher_idx(self, teacher):
        return list(self._teachers.keys()).index(teacher)

    def teacher_name(self, teacher_idx):
        assert 0 <= teacher_idx < len(self._teachers)
        return list(self._teachers.keys())[teacher_idx]

    def teacher_max_time(self, teacher_idx):
        assert 0 <= teacher_idx < len(self._teachers)
        return list(self._teachers.values())[teacher_idx]

    def preferred_teacher(self, level, subject):
        assert (
            level,
            subject,
        ) in self._preferred_teachers, (
            f"level/subject: '{level}'/'{subject}' not in PREFERRED_TEACHERS"
        )
        return self._preferred_teachers.get((level, subject))

    def preferred_teacher_time_slots(self, level, subject, time_slot):
        assert (
            level,
            subject,
            time_slot,
        ) in self._preferred_teachers_ts, f"level/subject/time_slot: '{level}'/'{subject}'/'{time_slot}' not in PREFERRED_TEACHERS_TIME_SLOTS"
        return self._preferred_teachers_ts.get((level, subject, time_slot))

    @property
    def specialties(self):
        return self._specialties

    def specialtie_teachers(self, subject):
        assert subject in self._subjects, f"{subject} not in SUBJECTS"
        return self._specialties[subject]

    @property
    def time_slots(self):
        return self._time_slots

    def slot_duration(self, slot_idx):
        assert 0 <= slot_idx < len(self._time_slots)
        return list(self._time_slots.values())[slot_idx]

    def slots_per_day(self):
        slots = {}
        tmp = 0
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in days:
            day_cnt = len([slot for slot in self._time_slots.keys() if day in slot])
            if day_cnt > 0: 
                slots[day] = (tmp, tmp + day_cnt - 1)
                tmp += day_cnt
        return slots

    def time_slot_idx(self, time_slot):
        return list(self._time_slots.keys()).index(time_slot)

    @property
    def location_room(self):
        return self._location_room

    def location_room_info(self, loc_idx):
        assert 0 <= loc_idx < len(self._location_room)
        return list(self._location_room.keys())[loc_idx]
    
class SchoolSchedulingSatSolutionPrinter(cp_model.CpSolverSolutionCallback):
    def __init__(self):
        cp_model.CpSolverSolutionCallback.__init__(self)
        self.__solution_count = 0

    def OnSolutionCallback(self):
        self.__solution_count += 1

import pandas as pd
from tabulate import tabulate


class SchoolSchedulingSatSolver:
    """Solver instance."""

    def __init__(self, problem=SchoolSchedulingProblem):
        self.EMPTY_SLOT = '0'

        # --------------------------------------------------------------------
        # Input data
        # --------------------------------------------------------------------
        self._problem = problem

        # Utilities
        num_levels = len(self._problem.levels)
        self._all_levels = range(num_levels)
        num_subjects = len(self._problem.subjects)
        self._all_subjects = range(num_subjects)
        num_teachers = len(self._problem.teachers)
        self._all_teachers = range(num_teachers)
        num_slots = len(self._problem.time_slots)
        self._all_slots = range(num_slots)
        num_locations = len(self._problem.location_room)
        self._all_locations = range(num_locations)

        # --------------------------------------------------------------------
        # Create the Model (CP-SAT)
        # --------------------------------------------------------------------
        self._model = cp_model.CpModel()

        # --------------------------------------------------------------------
        # Create the decision variables
        # --------------------------------------------------------------------
        self._assignment = {}

        for lvl_idx, level in enumerate(self._problem.levels):
            for sub_idx, subject in enumerate(self._problem.subjects):
                for tch_idx, teacher in enumerate(self._problem.teachers):
                    for slt_idx, slot in enumerate(self._problem.time_slots):
                        for loc_idx, loc in enumerate(self._problem.location_room):
                            key = (lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx)
                            name = f"{level} S:{subject} T:{teacher} Slot:{slot} Loc:{loc}"
                            if teacher in self._problem.specialtie_teachers(subject):
                                if self._problem.curriculum_contains(level, subject):
                                    self._assignment[key] = self._model.NewBoolVar(name)
                                else:
                                    name = "NO ASSIGNMENT " + name
                                    self._assignment[key] = self._model.NewIntVar(0, 0, name)
                            else:
                                name = "NO ASSIGNMENT " + name
                                self._assignment[key] = self._model.NewIntVar(0, 0, name)

        # --------------------------------------------------------------------
        # Constraints
        # --------------------------------------------------------------------

        # C1: CURRICULUM
        # Each level must have the quantity of classes per subject specified in the curriculum.
        for lvl_idx, level in enumerate(self._problem.levels):
            for sub_idx, subject in enumerate(self._problem.subjects):
                if self._problem.curriculum_contains(level, subject):
                    required_slots = self._problem.curriculum_time_request(level, subject)
                    self._model.Add(
                        sum(
                            self._assignment[lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx]
                            for tch_idx in self._all_teachers
                            for slt_idx in self._all_slots
                            for loc_idx in self._all_locations
                        )
                        == required_slots
                    )

        # C2: Each Level can do at most one class at a time.
        for lvl_idx in self._all_levels:
            for slt_idx in self._all_slots:
                self._model.Add(
                    sum(
                        [
                            self._assignment[lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx]
                            for sub_idx in self._all_subjects
                            for tch_idx in self._all_teachers
                            for loc_idx in self._all_locations
                        ]
                    )
                    <= 1
                )
        # Constraint C3 revised (ensure each class is assigned to at most one room at a time-slot, selected from available rooms).
        for lvl_idx, level in enumerate(self._problem.levels):
            for sub_idx in self._all_subjects:
                for tch_idx in self._all_teachers:
                    for slt_idx in self._all_slots:
                        # Get the list of available rooms for this class
                        available_rooms = data.CLASS_ROOMS.get(self._problem.levels[lvl_idx], [])

                        # Only consider assignments to available rooms
                        self._model.Add(
                            sum(
                                self._assignment[lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx]
                                for loc_idx, loc in enumerate(self._problem.location_room)
                                if loc in available_rooms
                            ) <= 1
                        )
                        # Ensure this class is not scheduled in rooms not available
                        for loc_idx, loc in enumerate(self._problem.location_room):
                            if loc not in available_rooms:
                                self._model.Add(self._assignment[lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx] == 0)

        # C4: Teacher can do at most one class at a time.
        for tch_idx in self._all_teachers:
            for slt_idx in self._all_slots:
                self._model.Add(
                    sum(
                        [
                            self._assignment[lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx]
                            for lvl_idx in self._all_levels
                            for sub_idx in self._all_subjects
                            for loc_idx in self._all_locations
                        ]
                    )
                    <= 1
                )

          # Consecutive block for each class


        # C5: Maximum work hours for each teacher.
        for tch_idx in self._all_teachers:
            self._model.Add(
                sum(
                    [
                        self._assignment[lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx]
                        for lvl_idx in self._all_levels
                        for sub_idx in self._all_subjects
                        for slt_idx in self._all_slots
                        for loc_idx in self._all_locations
                    ]
                )
                <= self._problem.teacher_max_time(tch_idx)
            )

        # C6: PREFERRED_TEACHERS
        # Assign your preferred teacher and let the solver choose the time slot
        # with sum() == number of curriculum required slots and select a random location/room.
        for (level, subject), teachers in self._problem._preferred_teachers.items():
            lvl_idx = self._problem.level_idx(level)
            sub_idx = self._problem.subject_idx(subject)
            allowed_values = [self._problem.teacher_idx(name) for name in teachers]
            required_slots = self._problem.curriculum_time_request(level, subject)
            self._model.Add(
                sum(
                    [
                        self._assignment[lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx]
                        for tch_idx in allowed_values
                        for slt_idx in self._all_slots
                        for loc_idx in self._all_locations
                    ]
                )
                == required_slots
            )

        # C7: PREFERRED_TEACHERS_TIME_SLOTS
        # Assign your preferred teacher for a fixed assignment of [level, subject, teacher, timeslot]
        # and select a random location/room.
        for (level, subject, time_slot), teachers in self._problem._preferred_teachers_ts.items():
            lvl_idx = self._problem.level_idx(level)
            sub_idx = self._problem.subject_idx(subject)
            slt_idx = self._problem.time_slot_idx(time_slot)
            allowed_values = [self._problem.teacher_idx(name) for name in teachers]
            self._model.Add(
                sum(
                    [
                        self._assignment[lvl_idx, sub_idx, allowed_values[0], slt_idx, loc_idx]
                        for loc_idx in self._all_locations
                    ]
                )
                == 1
            )


        # --------------------------------------------------------------------
        # Objective
        # --------------------------------------------------------------------
        # Count the number of free timeslots
        '''
        num_free_timeslots = sum([timeslot == 0 for row in schedule for timeslot in row])
        for tch_idx in self._all_teachers:
            ms = self.max_sequence_count(
                [
                    self._assignment[lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx]
                    for lvl_idx in self._all_levels
                    for sub_idx in self._all_subjects
                    for slt_idx in self._all_slots
                    for loc_idx in self._all_locations
                ]
            )
        '''




    def max_sequence_count(self, lst):
        count = 0
        result = 0
        n = len(lst)
        for i in range(0, n):
            if (lst[i] == self.EMPTY_SLOT):
                count = 0
            else:                
                count+= 1
                result = max(result, count)
        return result

    def teacher_slot_location_stats(self, tch_idx):
        table = {}
        row = []
        for day, (lb, ub) in self._problem.slots_per_day().items():
            for slt_idx in range(lb, ub + 1):
                teaching_hour = []
                for loc_idx, loc in enumerate(self._problem.location_room):
                    teaching_hour += [
                        loc[0]
                        for lvl_idx in self._all_levels
                        for sub_idx in self._all_subjects
                        if self._solver.BooleanValue(self._assignment[(lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx)]) == 1
                        ]
                if len(teaching_hour) > 0:
                    row += teaching_hour
                else:
                    row += self.EMPTY_SLOT
            max_sequence = self.max_sequence_count(row)
            table |= {day: [row, max_sequence]}
            row = []
        df = pd.DataFrame.from_dict(table, orient="index", columns=["slot_sequence(location)", "max_seq"])
        print(tabulate(df, headers="keys", tablefmt="psql"))




    def print_teacher_schedule(self, tch_idx):
        table = {}
        teacher_name = self._problem.teacher_name(tch_idx)
        total_working_hours = 0
        for slt_idx, slot in enumerate(self._problem.time_slots):
            for loc_idx, loc in enumerate(self._problem.location_room):
                for lvl_idx, level in enumerate(self._problem.levels):
                    for sub_idx, subject in enumerate(self._problem.subjects):
                        key = (lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx)
                        if self._solver.BooleanValue(self._assignment[key]):
                            total_working_hours += int(self._problem.slot_duration(slt_idx) / SCHOOL_HOUR)
                            table |= {slot: [level, subject, loc[0], loc[1]]}
        return {'name': teacher_name, 'schedule': table}
        df = pd.DataFrame.from_dict(table, orient="index", columns=["class", "subject", "bldg", "room"])
        print(tabulate(df, headers="keys", tablefmt="psql"))

    def print_class_schedule(self, lvl_idx):
        table = {}
        level = self._problem.levels[lvl_idx]
        total_working_hours = {}
        for sub in self._problem.subjects:
            total_working_hours[sub] = 0
        for slt_idx, slot in enumerate(self._problem.time_slots):
            for loc_idx, loc in enumerate(self._problem.location_room):
                for tch_idx, teacher in enumerate(self._problem.teachers):
                    for sub_idx, subject in enumerate(self._problem.subjects):
                        key = (lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx)
                        if self._solver.BooleanValue(self._assignment[key]):
                            total_working_hours[subject] += int(self._problem.slot_duration(slt_idx) / SCHOOL_HOUR)
                            table |= {slot: [subject, teacher, loc[0], loc[1]]}

        df = pd.DataFrame.from_dict(
            table, orient="index", columns=["subject", "teacher", "bldg", "room"]
        )
        return {'class': level, 'schedule': table}
        print(tabulate(df, headers="keys", tablefmt="psql"))

    def print_school_schedule(self):
        table = {}
        for slt_idx, slot in enumerate(self._problem.time_slots):
            tmp = ""
            for loc_idx, loc in enumerate(self._problem.location_room):
                for lvl_idx, level in enumerate(self._problem.levels):
                    for sub_idx, subject in enumerate(self._problem.subjects):
                        for tch_idx, teacher in enumerate(self._problem.teachers):
                            key = (lvl_idx, sub_idx, tch_idx, slt_idx, loc_idx)
                            if self._solver.BooleanValue(self._assignment[key]):
                                tmp += f" {level}:({subject},{teacher},{loc[0]},{loc[1]})"
                table |= {slot: [tmp]}
        df = pd.DataFrame.from_dict(
            table, orient="index", columns=["class:(subject, teacher, bldg, room)"]
        )
        return(table)
        print(tabulate(df, headers="keys", tablefmt="psql"))

    def solve(self):
        # --------------------------------------------------------------------
        # Create Solver and Printer
        # --------------------------------------------------------------------
        self._solver = cp_model.CpSolver()
        self._solver.parameters.max_time_in_seconds = 1020.0  
        self._solver.parameters.num_search_workers = 4  
        solution_printer = SchoolSchedulingSatSolutionPrinter()

        # --------------------------------------------------------------------
        # Solve the problem
        # --------------------------------------------------------------------
        status = self._solver.Solve(self._model, solution_printer)

        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            finalDict = {}
            finalDict['teachers'] = {}
            finalDict['classes'] = {}
            finalDict['school'] = {}

            for teacher_idx in self._all_teachers:
                teacher_schedule = self.print_teacher_schedule(teacher_idx)
                teacher_name = teacher_schedule['name']  # Access the teacher's name from the returned dictionary
                finalDict['teachers'][teacher_name] = teacher_schedule['schedule']

            for level_idx in self._all_levels:
                class_schedule = self.print_class_schedule(level_idx)
                sclass_name = class_schedule['class']  # Access the teacher's name from the returned dictionary
                finalDict['classes'][sclass_name] = class_schedule['schedule']

            school_schedule = self.print_school_schedule()
            finalDict['school'] = school_schedule

        return finalDict


'''
problem = SchoolSchedulingProblem(
    LEVELS,
    SUBJECTS,
    CURRICULUM,
    TEACHERS,
    PREFERRED_TEACHERS,
    PREFERRED_TEACHERS_TIME_SLOTS,
    SPECIALTIES,
    TIME_SLOTS,
    LOCATION_ROOM
)

solver = SchoolSchedulingSatSolver(problem)
data = solver.solve()
json_data = json.dumps(data)
print(json_data)
'''

import sys
import json

def main():

    try:

        problem = SchoolSchedulingProblem(
            data.LEVELS,
            data.SUBJECTS,
            data.CURRICULUM,
            data.TEACHERS,
            data.PREFERRED_TEACHERS,
            data.PREFERRED_TEACHERS_TIME_SLOTS,
            data.SPECIALTIES,
            data.TIME_SLOTS,
            data.LOCATION_ROOM
        )

        # Solve the problem
        solver = SchoolSchedulingSatSolver(problem)
        solution = solver.solve()

        # Convert solution to JSON and print it to stdout
        print(json.dumps(solution))

    except json.JSONDecodeError:
        # Handle invalid JSON input
        print(json.dumps({"error": "Invalid JSON input"}))
        sys.exit(1)

    except Exception as e:
        # Handle other exceptions
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()

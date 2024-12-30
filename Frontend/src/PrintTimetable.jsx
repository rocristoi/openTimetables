import React, { forwardRef } from 'react';
import { useReactTable, flexRender, getCoreRowModel } from '@tanstack/react-table';



const PrintTimetables = forwardRef(({ data, clasa, type }, ref) => {
  const { fullTimetable, getTimetableForClass, getOrderedTimeSlots, getTimetableForTeacher } = createTimetable(data);
  const hours = getOrderedTimeSlots();
  let dataTimetable = {}
  let columns = []
  if(type == "Class") {
     dataTimetable = getTimetableForClass(clasa);
     columns = [
      {
        accessorKey: 'timeSlot',
        header: 'Time / Day',
      },
      ...hours.map((dayObj) => {
        const dayName = Object.keys(dayObj)[0];
        return {
          accessorKey: dayName,
          header: dayName,
          cell: (info) => {
            const timeSlot = info.row.original?.timeSlot ?? '';
            const timeKey = timeSlot.split(':')[0];
            const classDetail = dataTimetable[dayName] ? dataTimetable[dayName][timeKey] : null;
  
            return classDetail ? (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="font-bold">{classDetail.subject}</span>
                <span>{classDetail.teacher}</span>
                <span className="text-sm text-gray-500">
                  {classDetail.location.room}, {classDetail.location.floor}
                </span>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center'>
              <span className="text-gray-400">N/A</span>
              </div>
            );
          },
        };
      }),
    ];
  } if(type == "Teacher") {
     dataTimetable = getTimetableForTeacher(clasa);
     columns = [
      {
        accessorKey: 'timeSlot',
        header: 'Time / Day',
      },
      ...hours.map((dayObj) => {
        const dayName = Object.keys(dayObj)[0];
        return {
          accessorKey: dayName,
          header: dayName,
          cell: (info) => {
            const timeSlot = info.row.original?.timeSlot ?? '';
            const timeKey = timeSlot.split(':')[0];
            const classDetail = dataTimetable[dayName] ? dataTimetable[dayName][timeKey] : null;
  
            return classDetail ? (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="font-bold">{classDetail.subject}</span>
                <span>{classDetail.teacher}</span>
                <span className="text-sm text-gray-500">
                  {classDetail.location.room}, {classDetail.location.floor}
                </span>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center'>
              <span className="text-gray-400">N/A</span>
              </div>
            );
          },
        };
      }),
    ];
  } if(type == "School") {
    dataTimetable = fullTimetable
    columns = [
      {
        accessorKey: 'timeSlot',
        header: 'Time / Day',
      },
      ...hours.map((dayObj) => {
        const dayName = Object.keys(dayObj)[0];
        return {
          accessorKey: dayName,
          header: dayName,
          cell: (info) => {
            const timeSlot = info.row.original?.timeSlot ?? '';
            const timeKey = timeSlot.split(':')[0];
            const classDetail = dataTimetable[dayName] ? dataTimetable[dayName][timeKey] : null;
  
            return classDetail ? (
              <div className="flex flex-col items-center justify-center text-center gap-5">
                {classDetail.map(clasa => (
                  <div className='flex flex-col items-center justify-center text-center'>
                    <span className="font-bold">{clasa.subject}</span>
                    <span>{clasa.teacher}</span>
                    <span className="text-sm text-gray-500">
                      {clasa.location.room}, {clasa.location.floor}
                    </span>
                    </div>
                ))}
              
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center'>
              <span className="text-gray-400">N/A</span>
              </div>
            );
          },
        };
      }),
    ];
  }



  const tableData = hours[0].Monday.map((slot, index) => {
    const row = { timeSlot: slot };
    hours.forEach((dayObj) => {
      const dayName = Object.keys(dayObj)[0];
      const timeKey = slot.split('-')[0];
      const classDetail = dataTimetable[dayName] ? dataTimetable[dayName][timeKey] : null;
      row[dayName] = classDetail;
    });
    return row;
  });

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4" ref={ref}>
      <div className="overflow-x-auto">
        <table className="table-auto w-[1600px] border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 border border-gray-300 text-left text-xl font-medium text-gray-700"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 border border-gray-300 text-xl font text-gray-700"
                  >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
// Helper function to process timetable data
function createTimetable(data) {
  const timetable = {};

  for (const [timeSlot, classDetails] of Object.entries(data.school)) {
    const [day, time] = timeSlot.split(':');

    if (!timetable[day]) {
      timetable[day] = {};
    }

    timetable[day][time] = classDetails[0]
      ? classDetails[0].split(')').filter(Boolean).map(classInfo => {
          const [className, otherInfo] = classInfo.trim().split(':(');
          const [subject, teacher, floor, room] = otherInfo.split(',');

          return {
            className: className.trim(),
            subject: subject.trim(),
            teacher: teacher.trim(),
            location: {
              floor: floor.trim(),
              room: room.trim(),
            },
          };
        })
      : [];
  }

  const getSchedule = (identifier, category) => {
    let schedule = {};

    for (const [day, timeSlots] of Object.entries(timetable)) {
      for (const [time, classes] of Object.entries(timeSlots)) {
        for (const classDetail of classes) {
          if (classDetail[category] === identifier) {
            if (!schedule[day]) {
              schedule[day] = {};
            }

            schedule[day][time] = classDetail;
          }
        }
      }
    }

    return schedule;
  };

  const getOrderedTimeSlots = () => {
    const orderedSchedule = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    daysOfWeek.forEach(day => {
      if (timetable[day]) {
        const timeSlots = Object.keys(timetable[day]).sort();
        const daySchedule = {};
        daySchedule[day] = timeSlots.map(time => `${time}:00-${(parseInt(time.split('-')[0]) + 1) % 24}:00`);
        orderedSchedule.push(daySchedule);
      }
    });

    return orderedSchedule;
  };

  return {
    fullTimetable: timetable,
    getTimetableForClass: className => getSchedule(className, 'className'),
    getTimetableForTeacher: teacherName => getSchedule(teacherName, 'teacher'),
    getOrderedTimeSlots,
  };
}

export default PrintTimetables;
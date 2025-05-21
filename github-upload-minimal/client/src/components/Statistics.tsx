import { DayEntry } from "@/types";
import { formatTimeTo12Hour, formatHoursWithLabel } from "@/lib/utils/time";

interface StatisticsProps {
  entries: Record<string, DayEntry>;
  currentMonth: Date;
}

export default function Statistics({ entries, currentMonth }: StatisticsProps) {
  // Calculate statistics for the given month
  const stats = calculateMonthlyStats(entries, currentMonth);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">월간 요약</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Work Hour Summary Card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              근무 시간 요약
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">사무실 근무:</span>
                <span className="font-semibold text-gray-900">
                  {formatHoursWithLabel(stats.officeHours)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">재택 근무:</span>
                <span className="font-semibold text-gray-900">
                  {formatHoursWithLabel(stats.remoteHours)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">연차:</span>
                <span className="font-semibold text-gray-900">
                  {formatHoursWithLabel(stats.annualLeaveHours)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  총 근무 시간:
                </span>
                <span className="font-bold text-primary-700">
                  {formatHoursWithLabel(stats.totalHours)}
                </span>
              </div>
            </div>
          </div>

          {/* Work Hours Balance Card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              근무 시간 밸런스
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">기준 시간:</span>
                <span className="font-semibold text-gray-900">
                  {formatHoursWithLabel(stats.standardHours)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">사무실 근무:</span>
                <span className={`font-semibold ${stats.officeOverwork >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.officeOverwork >= 0 ? 
                    <>+{formatHoursWithLabel(stats.officeOverwork)}</> : 
                    <>-{formatHoursWithLabel(Math.abs(stats.officeOverwork))}</>
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">재택 근무:</span>
                <span className={`font-semibold ${stats.remoteOverwork >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.remoteOverwork >= 0 ? 
                    <>+{formatHoursWithLabel(stats.remoteOverwork)}</> : 
                    <>-{formatHoursWithLabel(Math.abs(stats.remoteOverwork))}</>
                  }
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  총 밸런스:
                </span>
                <span className={`font-bold ${stats.totalOverwork >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.totalOverwork >= 0 ? 
                    <>+{formatHoursWithLabel(stats.totalOverwork)}</> : 
                    <>-{formatHoursWithLabel(Math.abs(stats.totalOverwork))}</>
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Average Hours Card */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              평균 및 분포
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">평균 사무실 근무일:</span>
                <span className="font-semibold text-gray-900">
                  {formatHoursWithLabel(stats.averageOfficeHours)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">평균 재택 근무일:</span>
                <span className="font-semibold text-gray-900">
                  {formatHoursWithLabel(stats.averageRemoteHours)}
                </span>
              </div>


              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-1">
                  {stats.officeDays > 0 && (
                    <div 
                      className={`h-4 bg-blue-500 ${stats.remoteDays === 0 ? "rounded" : "rounded-l"}`} 
                      style={{ width: `${stats.officePercentage}%` }}
                    ></div>
                  )}
                  {stats.remoteDays > 0 && (
                    <div 
                      className={`h-4 bg-green-500 ${stats.officeDays === 0 ? "rounded-l" : "rounded-r"}`} 
                      style={{ width: `${stats.remotePercentage}%` }}
                    ></div>
                  )}
                </div>
                <div className="flex text-xs mt-1 text-gray-500 justify-between">
                  {stats.officeDays > 0 && (
                    <span>사무실 ({stats.officePercentage}%)</span>
                  )}
                  {stats.remoteDays > 0 && (
                    <span>재택 ({stats.remotePercentage}%)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateMonthlyStats(entries: Record<string, DayEntry>, currentMonth: Date) {
  // Initialize stats
  let officeHours = 0;
  let remoteHours = 0;
  let annualLeaveHours = 0;
  let officeDays = 0;
  let remoteDays = 0;
  let leaveDays = 0;
  let workDays = 0;

  // Get business days in month (excluding weekends)
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let businessDays = 0;

  // Loop through all days in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    
    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
      
      // Date string in format YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries[dateStr];
      
      if (entry) {
        workDays++;
        
        // Sum hours by type
        if (entry.workType === "office") {
          officeHours += entry.totalHours;
          officeDays++;
        } else if (entry.workType === "remote") {
          remoteHours += entry.totalHours;
          remoteDays++;
        } else if (entry.workType === "annual-leave") {
          annualLeaveHours += entry.totalHours;
          leaveDays++;
        }
      }
    }
  }

  // Calculate work hours (excluding annual leave)
  const totalWorkHours = officeHours + remoteHours;
  
  // Calculate standard hours (8 hours per working day)
  const standardHours = (officeDays + remoteDays) * 8;
  
  // Calculate overwork (excluding annual leave)
  const officeOverwork = officeHours - (officeDays * 8);
  const remoteOverwork = remoteHours - (remoteDays * 8);
  const totalOverwork = totalWorkHours - standardHours;
  
  // Calculate averages
  const averageOfficeHours = officeDays > 0 ? officeHours / officeDays : 0;
  const averageRemoteHours = remoteDays > 0 ? remoteHours / remoteDays : 0;
  
  // Calculate percentages for the chart
  // For remote vs office comparison, exclude annual leave days
  const workOnlyDays = officeDays + remoteDays;
  const officePercentage = workOnlyDays > 0 ? Math.round((officeDays / workOnlyDays) * 100) : 0;
  const remotePercentage = workOnlyDays > 0 ? Math.round((remoteDays / workOnlyDays) * 100) : 0;
  
  // For overall days distribution, include all days
  const totalDays = officeDays + remoteDays + leaveDays;
  const leavePercentage = totalDays > 0 ? Math.round((leaveDays / totalDays) * 100) : 0;
  
  return {
    officeHours,
    remoteHours,
    annualLeaveHours,
    totalHours: totalWorkHours, // Return work hours (office + remote only)
    standardHours,
    officeOverwork,
    remoteOverwork,
    totalOverwork,
    officeDays,
    remoteDays,
    leaveDays,
    workDays,
    businessDays,
    averageOfficeHours,
    averageRemoteHours,
    officePercentage,
    remotePercentage,
    leavePercentage
  };
}

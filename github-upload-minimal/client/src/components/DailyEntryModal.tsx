import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { DayEntry, WorkType } from "@/types";
import { calculateWorkHours, formatTimeTo12Hour, formatHoursWithLabel } from "@/lib/utils/time";
import { useToast } from "@/hooks/use-toast";

interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  entry: DayEntry | null;
  onSave: (date: string, entry: DayEntry) => void;
}

export default function DailyEntryModal({
  isOpen,
  onClose,
  date,
  entry,
  onSave,
}: DailyEntryModalProps) {
  const { toast } = useToast();
  const [workType, setWorkType] = useState<WorkType>("office");
  const [checkinTime, setCheckinTime] = useState("09:00");
  const [checkoutTime, setCheckoutTime] = useState("17:00");
  const [leaveHours, setLeaveHours] = useState(8);
  const [hourlyLeave, setHourlyLeave] = useState(0);
  const [outsideTime, setOutsideTime] = useState(0);
  const [dinnerMeal, setDinnerMeal] = useState(false);
  const [calculatedHours, setCalculatedHours] = useState({
    rawHours: 8,
    breakDeduction: 1,
    outsideTimeHours: 0,
    totalHours: 7,
  });

  // Format the date for display
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Reset form when entry changes
  useEffect(() => {
    if (entry) {
      setWorkType(entry.workType);
      setCheckinTime(entry.checkinTime || "09:00");
      setCheckoutTime(entry.checkoutTime || "17:00");
      setLeaveHours(entry.annualLeaveHours || 8);
      setHourlyLeave(entry.hourlyLeave || 0);
      setOutsideTime(entry.outsideTime || 0);
      setDinnerMeal(entry.dinnerMeal || false);
    } else {
      // Default values
      setWorkType("office");
      setCheckinTime("09:00");
      setCheckoutTime("17:00");
      setLeaveHours(8);
      setHourlyLeave(0);
      setOutsideTime(0);
      setDinnerMeal(false);
    }
  }, [entry, isOpen]);

  // Recalculate when inputs change
  useEffect(() => {
    const hours = calculateWorkHours({
      workType,
      checkinTime,
      checkoutTime,
      annualLeaveHours: leaveHours,
      hourlyLeave,
      outsideTime,
      dinnerMeal,
    });
    setCalculatedHours(hours);
  }, [workType, checkinTime, checkoutTime, leaveHours, hourlyLeave, outsideTime, dinnerMeal]);

  const handleSave = () => {
    const newEntry: DayEntry = {
      workType,
      checkinTime: workType !== "annual-leave" ? checkinTime : undefined,
      checkoutTime: workType !== "annual-leave" ? checkoutTime : undefined,
      annualLeaveHours: workType === "annual-leave" ? leaveHours : 0,
      hourlyLeave: workType !== "annual-leave" ? hourlyLeave : 0,
      outsideTime,
      dinnerMeal,
      totalHours: calculatedHours.totalHours,
      rawHours: calculatedHours.rawHours,
      breakDeduction: calculatedHours.breakDeduction,
    };

    onSave(date, newEntry);
    toast({
      title: "Entry Saved",
      description: `Work hours for ${formattedDate} have been saved.`,
    });
    onClose();
  };

  // Display time in 12-hour format
  const displayCheckinTime = formatTimeTo12Hour(checkinTime);
  const displayCheckoutTime = formatTimeTo12Hour(checkoutTime);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>근무 시간 - {formattedDate}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {/* Work Type Selection */}
            <div>
              <Label className="block text-sm font-medium mb-1">근무 유형</Label>
              <RadioGroup
                value={workType}
                onValueChange={(val) => setWorkType(val as WorkType)}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-2 rounded-md border px-3 py-2 bg-blue-50">
                  <RadioGroupItem value="office" id="office" />
                  <Label htmlFor="office" className="cursor-pointer">사무실</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border px-3 py-2 bg-green-50">
                  <RadioGroupItem value="remote" id="remote" />
                  <Label htmlFor="remote" className="cursor-pointer">재택</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border px-3 py-2 bg-amber-50">
                  <RadioGroupItem value="annual-leave" id="annual-leave" />
                  <Label htmlFor="annual-leave" className="cursor-pointer">연차</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Check-in/Check-out Times */}
            {workType !== "annual-leave" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkinTime" className="block text-sm font-medium mb-1">
                    출근 시간
                  </Label>
                  <Input
                    type="time"
                    id="checkinTime"
                    value={checkinTime}
                    onChange={(e) => setCheckinTime(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">{displayCheckinTime}</p>
                </div>
                <div>
                  <Label htmlFor="checkoutTime" className="block text-sm font-medium mb-1">
                    퇴근 시간
                  </Label>
                  <Input
                    type="time"
                    id="checkoutTime"
                    value={checkoutTime}
                    onChange={(e) => setCheckoutTime(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">{displayCheckoutTime}</p>
                </div>
              </div>
            )}

            {/* Annual Leave Hours - shown only for annual leave type */}
            {workType === "annual-leave" && (
              <div>
                <Label htmlFor="leaveHours" className="block text-sm font-medium mb-1">
                  연차 시간
                </Label>
                <select
                  id="leaveHours"
                  value={leaveHours}
                  onChange={(e) => setLeaveHours(parseFloat(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {/* For full day annual leave, offer 4 to 8 hours */}
                  {Array.from({ length: 5 }, (_, i) => i + 4).map((hours) => (
                    <option key={hours} value={hours}>
                      {hours}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Hourly Leave - shown for office or remote work types */}
            {workType !== "annual-leave" && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="hourlyLeave" className="block text-sm font-medium">
                    시간차
                  </Label>
                  <span className="text-xs text-gray-500">선택사항</span>
                </div>
                <div className="flex items-center">
                  <select
                    id="hourlyLeave"
                    value={hourlyLeave}
                    onChange={(e) => setHourlyLeave(parseFloat(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {/* Offer 0 to 4 hours in 1-hour increments */}
                    {[0, 1, 2, 3, 4].map((hours) => (
                      <option key={hours} value={hours}>
                        {hours === 0 ? "휴가 없음" : `${hours}`}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  정규 근무 시간 중 사용한 휴가 시간
                </p>
              </div>
            )}

            {/* Outside Time */}
            <div>
              <Label htmlFor="outsideTime" className="block text-sm font-medium mb-1">
                외출
              </Label>
              <div className="flex items-center">
                <select
                  id="outsideTime"
                  value={outsideTime}
                  onChange={(e) => setOutsideTime(parseInt(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {Array.from({ length: 9 }, (_, i) => i * 30).map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes}분
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                근무 시간 중 개인 용무로 사용한 시간
              </p>
            </div>

            {/* Dinner Meal Request */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dinnerMeal"
                checked={dinnerMeal}
                onCheckedChange={(checked) => setDinnerMeal(checked as boolean)}
              />
              <Label htmlFor="dinnerMeal" className="text-sm">
                석식 신청
              </Label>
              <span className="text-xs text-gray-500 ml-2">(30분 공제)</span>
            </div>

            {/* Calculated Work Hours */}
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                계산된 근무 시간
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">기본 시간:</div>
                <div className="text-gray-900 font-medium">
                  {formatHoursWithLabel(calculatedHours.rawHours)}
                </div>

                <div className="text-gray-600">휴식 시간 공제:</div>
                <div className="text-gray-900 font-medium">
                  {calculatedHours.breakDeduction > 0
                    ? `-${formatHoursWithLabel(calculatedHours.breakDeduction)}`
                    : "0시간"}
                </div>

                <div className="text-gray-600">외출 시간:</div>
                <div className="text-gray-900 font-medium">
                  {calculatedHours.outsideTimeHours > 0
                    ? `-${formatHoursWithLabel(calculatedHours.outsideTimeHours)}`
                    : "0시간"}
                </div>

                <div className="text-gray-600 font-medium pt-2 border-t border-gray-300">
                  총 근무 시간:
                </div>
                <div className="text-primary-700 font-bold pt-2 border-t border-gray-300">
                  {formatHoursWithLabel(calculatedHours.totalHours)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

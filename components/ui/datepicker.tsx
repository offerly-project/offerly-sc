import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
	value?: Date;
	onChange?: (date: Date | undefined) => void;
	minDate?: Date;
	maxDate?: Date;
	label?: string;
	error?: string;
};

export function DatePicker({
	value,
	onChange,
	minDate,
	maxDate,
	label,
	error,
}: DatePickerProps) {
	const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
		value
	);

	// Handle both internal state and the onChange prop
	const handleDateChange = (newDate: Date | undefined) => {
		setSelectedDate(newDate);
		onChange?.(newDate);
	};

	React.useEffect(() => {
		// Update internal state if `date` prop changes
		if (value !== selectedDate) {
			setSelectedDate(value);
		}
	}, [value]);

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>
					<div className="flex-row flex space-x-2 items-center">
						{label && (
							<p className="text-sm text-gray-500 whitespace-nowrap">{label}</p>
						)}
						<div className="w-full">
							<Button
								variant={"outline"}
								className={cn(
									"w-full justify-start text-left font-normal",
									!selectedDate && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{selectedDate ? (
									format(selectedDate, "PPP")
								) : (
									<span>Pick a date</span>
								)}
							</Button>
							{error && (
								<div className="text-red-600 pt-1 text-sm">{error}</div>
							)}
						</div>
					</div>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={handleDateChange}
						fromDate={minDate}
						toDate={maxDate}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</>
	);
}

import React, { useRef, useContext } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "react-feather";
import { Manager, Reference, Popper } from "react-popper";
import {
  DatepickerCtx,
  useDatepickerCtx,
  DatepickerConfig,
  daysInMonth,
} from "./DatepickerContext";

const daysOfWeekNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const inputStyle = {
  paddingTop: "0.375rem",
  paddingBottom: "0.375rem",
};

interface DatePickerProps {
  config: DatepickerConfig;
  onChange: (date: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = (props) => (
  <RawDatePicker
    config={props.config}
    onChange={props.onChange}
  ></RawDatePicker>
);

export const RawDatePicker: React.FC<{
  config: DatepickerConfig;
  onChange: (date: Date) => void;
}> = ({ config, onChange }) => {
  const popupNode = useRef<HTMLElement>();
  const ctxValue = useDatepickerCtx(config, onChange, popupNode);

  return (
    <DatepickerCtx.Provider value={ctxValue}>
      <Manager>
        <Reference>
          {({ ref }) => (
            <div className="flex" ref={ref}>
              <input
                className="border-2 rounded-l px-3 outline-none focus:border-gray-400 flex-grow"
                type="text"
                style={inputStyle}
                onFocus={(e) => ctxValue.showCalendar()}
                value={formattedDate(config.date)}
                readOnly
              />
              <button
                className="bg-gray-300 rounded-r flex items-center justify-center text-sm font-semibold text-gray-700 px-2 focus:outline-none"
                onClick={(e) => ctxValue.toggleCalendar()}
              >
                <CalendarIcon size="20" color="#666" />
              </button>
            </div>
          )}
        </Reference>
        <Popper
          placement="bottom-start"
          innerRef={(node) => (popupNode.current = node)}
        >
          {({ ref, style, placement, arrowProps }) =>
            ctxValue.isVisible ? (
              <Calendar
                placement={placement}
                style={style}
                ref={ref as React.Ref<HTMLDivElement>}
              />
            ) : null
          }
        </Popper>
      </Manager>
    </DatepickerCtx.Provider>
  );
};

interface CalendarProps {
  style: React.CSSProperties;
  placement: string;
  ref: React.Ref<HTMLDivElement>;
}

const Calendar: React.FC<CalendarProps> = React.forwardRef<
  HTMLDivElement,
  CalendarProps
>((props, ref) => {
  const { view } = useContext(DatepickerCtx);

  let selectionComponent = null;
  switch (view) {
    case "date":
      selectionComponent = <DateSelection />;
      break;
    case "month":
      selectionComponent = <MonthSelection />;
      break;
    case "year":
      selectionComponent = <YearSelection />;
      break;
  }

  return (
    <div
      className="bg-white relative shadow-lg max-w-xs w-64 p-2 rounded-lg"
      ref={ref}
      data-placement={props.placement}
      style={props.style}
    >
      {selectionComponent}
    </div>
  );
});

/**
 * Date Selection Component
 * @param props
 */
const DateSelection: React.FC<{}> = (props) => {
  const {
    nextMonth,
    prevMonth,
    viewMonths,
    viewYears,
    selectDate,
    visible: { month, year },
    isSelected,
    isValid,
  } = useContext(DatepickerCtx);
  const dates = [];

  for (let i = 0; i < beginningDayOfWeek(month, year); i++) {
    dates.push(<div key={`emptybefore${i}`}></div>);
  }

  for (let i = 1; i <= daysInMonth(month, year); i++) {
    if (isValid({ day: i, month, year })) {
      dates.push(
        <button
          key={`day${i}`}
          className={`hover:bg-gray-200 rounded p-1 text-sm ${
            isSelected(i) ? "bg-blue-400 hover:text-gray-800 text-white font-semibold" : ""
          }`}
          onClick={() => selectDate(i)}
          style={{ textAlign: "center" }}
        >
          {i}
        </button>
      );
    } else {
      dates.push(
        <button
          key={`day${i}`}
          className={`hover:bg-gray-200 rounded p-1 text-sm text-gray-300 `}
          style={{ textAlign: "center" }}
        >
          {i}
        </button>
      );
    }
  }

  return (
    <div
      className="text-gray-800"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        gridTemplateRows: "2rem auto",
        alignItems: "stretch",
      }}
    >
      <button className={buttonClassName} onClick={(e) => prevMonth()}>
        <ChevronLeft size={20} className="stroke-current" />
      </button>

      <button
        className={`${buttonClassName} font-semibold`}
        style={{ gridColumn: "2/5" }}
        onClick={(e) => viewMonths()}
      >
        {monthNames[month]}
      </button>

      <button
        className={`${buttonClassName} font-semibold`}
        style={{ gridColumn: "5/7" }}
        onClick={(e) => viewYears()}
      >
        {year}
      </button>

      <button className={buttonClassName} onClick={(e) => nextMonth()}>
        <ChevronRight size={20} className="stroke-current" />
      </button>

      {daysOfWeekNames.map((day) => (
        <div
          key={(200 + day).toString()}
          className="p-1 text-sm font-semibold"
          style={{ textAlign: "center" }}
        >
          {day[0]}
        </div>
      ))}

      {dates}
    </div>
  );
};

/**
 * Month Selection Component
 * @param props
 */
const MonthSelection: React.FC<{}> = (props) => {
  const {
    viewYears,
    selectMonth,
    nextYear,
    prevYear,
    visible,
    isValid,
    isSelected
  } = useContext(DatepickerCtx);

  return (
    <div
      className="h-48"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gridTemplateRows: "2rem auto",
        alignItems: "stretch",
      }}
    >
      <div className="flex border-b" style={{ gridColumn: "1/5" }}>
        <CalButton chevron="left" onClick={(e) => prevYear()} />
        <CalButton
          className="flex-grow font-semibold"
          onClick={(e) => viewYears()}
        >
          {visible.year}
        </CalButton>
        <CalButton chevron="right" onClick={(e) => nextYear()} />
      </div>
      {monthNames.map((month, index) => {
        if (isValid({ month: index, year: visible.year })) {
          return (
            <CalButton className={isSelected(index) ? "bg-blue-400 hover:text-gray-800 text-white font-semibold" : ""} onClick={(e) => selectMonth(index)}>
              {month.substring(0, 3)}
            </CalButton>
          );
        } else {
          return (
            <CalButton className="text-gray-300">
              {month.substring(0, 3)}
            </CalButton>
          );
        }
      })}
    </div>
  );
};

/**
 * Year Selection Component
 * @param props
 */
const YearSelection: React.FC<{}> = (props) => {
  const {
    selectYear,
    prevDecade,
    nextDecade,
    isSelected,
    isValid,
    visible: { year },
  } = useContext(DatepickerCtx);

  let years = [];
  let [minYear, maxYear] = [year - 6, year + 6];

  for (let i = minYear; i < maxYear; i++) {
    if(isValid({year: i})) {
      years.push(<CalButton className={isSelected(i) ? "bg-blue-400 hover:text-gray-800 text-white font-semibold" : ""} onClick={(e) => selectYear(i)}>{i}</CalButton>);
    } else {
      years.push(<CalButton className="text-gray-300">{i}</CalButton>);
    
    }
   }

  return (
    <div
      className="h-48"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gridTemplateRows: "2rem auto",
        alignItems: "stretch",
      }}
    >
      <div className="flex border-b" style={{ gridColumn: "1/5" }}>
        <CalButton chevron="left" onClick={(e) => prevDecade()} />
        <CalButton className="flex-grow font-medium">
          {`${minYear} - ${maxYear - 1}`}
        </CalButton>
        <CalButton chevron="right" onClick={(e) => nextDecade()} />
      </div>

      {years}
    </div>
  );
};

const buttonClassName =
  "hover:bg-gray-200 rounded p-1 text-sm flex align-center items-center justify-center focus:outline-none";

const CalButton: React.FC<{
  chevron?: "right" | "left";
  className?: string;
  style?: React.StyleHTMLAttributes<HTMLButtonElement>;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}> = (props) => {
  let children = null;

  if (props.chevron && props.chevron === "left")
    children = <ChevronLeft size={20} className="stroke-current" />;
  else if (props.chevron && props.chevron === "right")
    children = <ChevronRight size={20} className="stroke-current" />;
  else children = props.children;

  return (
    <button
      className={`${buttonClassName} ${props.className}`}
      style={props.style}
      onClick={props.onClick}
    >
      {children}
    </button>
  );
};

/**
 * Util functions
 */
/**
 * For formatting date
 * @param date
 */
function formattedDate(date: Date): string {
  return `${date.getDate()} ${
    monthNames[date.getMonth()]
  } ${date.getFullYear()}`;
}

/**
 * Beginning of Day of Week of a Month
 * @param date
 */
function beginningDayOfWeek(m: number, y: number): number {
  return new Date(y, m, 1).getDay();
}

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker, defaultStaticRanges } from "react-date-range";
import { useEffect, useContext, useRef } from "react";
import overviewContext from "../../../store/overview/overviewContext";
import { subDays } from "date-fns";

const CustomDateRangePicker = ({ onClose }) => {
    const { dateRange, setDateRange } = useContext(overviewContext)
    const wrapperRef = useRef(null);

    const filteredStaticRanges = defaultStaticRanges.filter(range => (range.label !== "Today" && range.label !== "This Week"));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div ref={wrapperRef}>
            <DateRangePicker
                onChange={(item) => { setDateRange([item.selection]); console.log(item.selection) }}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={2}
                ranges={dateRange}
                direction="horizontal"
                minDate={subDays(new Date(), 46)}
                maxDate={subDays(new Date(), 1)}
                staticRanges={filteredStaticRanges}
            />
        </div>
    );
};

export default CustomDateRangePicker;

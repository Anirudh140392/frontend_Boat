import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker, createStaticRanges } from "react-date-range";
import { useEffect, useContext, useRef, useState, useMemo } from "react";
import overviewContext from "../../../store/overview/overviewContext";
import { subDays, startOfMonth, endOfMonth, subMonths, startOfDay } from "date-fns";
import { Button, Box } from "@mui/material";

const CustomDateRangePicker = ({ onClose }) => {
    const { dateRange, setDateRange } = useContext(overviewContext)
    const [tempDateRange, setTempDateRange] = useState(dateRange);
    const wrapperRef = useRef(null);

    const customStaticRanges = useMemo(() => {
        const today = startOfDay(new Date());
        const yesterday = subDays(today, 1);

        return createStaticRanges([
            {
                label: "Yesterday",
                range: () => ({
                    startDate: yesterday,
                    endDate: yesterday,
                }),
            },
            {
                label: "Last 7 Days",
                range: () => ({
                    startDate: subDays(today, 7),
                    endDate: yesterday,
                }),
            },
            {
                label: "Last 30 Days",
                range: () => ({
                    startDate: subDays(today, 30),
                    endDate: yesterday,
                }),
            },
            {
                label: "This Month",
                range: () => ({
                    startDate: startOfMonth(today),
                    endDate: yesterday,
                }),
            },
            {
                label: "Last Month",
                range: () => ({
                    startDate: startOfMonth(subMonths(today, 1)),
                    endDate: endOfMonth(subMonths(today, 1)),
                }),
            },
        ]);
    }, []);

    const handleApply = () => {
        setDateRange(tempDateRange);
        onClose();
    };

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
        <div ref={wrapperRef} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '10px' }}>
            <DateRangePicker
                onChange={(item) => { setTempDateRange([item.selection]); console.log(item.selection) }}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={2}
                ranges={tempDateRange}
                direction="horizontal"
                minDate={subDays(new Date(), 46)}
                maxDate={subDays(new Date(), 1)}
                staticRanges={customStaticRanges}
                inputRanges={[]}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderTop: '1px solid #f0f0f0', mt: 1 }}>
                <Button
                    variant="contained"
                    onClick={handleApply}
                    sx={{
                        background: 'linear-gradient(45deg, #7C3AED 30%, #9061F9 90%)',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 4,
                        '&:hover': {
                            background: 'linear-gradient(45deg, #6D28D9 30%, #7C3AED 90%)',
                            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                        }
                    }}
                >
                    Apply
                </Button>
            </Box>
        </div>
    );
};

export default CustomDateRangePicker;

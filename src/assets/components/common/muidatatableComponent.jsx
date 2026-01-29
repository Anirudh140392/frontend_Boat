import React, { useContext, useState } from "react";
import { Box, Button } from "@mui/material";
import { DataGrid, GridToolbarContainer, GridFilterPanel, GridToolbarColumnsButton, GridToolbarDensitySelector, GridToolbarFilterButton } from "@mui/x-data-grid";
import CircularProgress from '@mui/material/CircularProgress';
import overviewContext from "../../../store/overview/overviewContext";
import ExcelDownloadButton from "../molecules/excelDownloadButton";

const CustomFilterPanel = (props) => {

    const handleSearchClick = () => {
        console.log('Search button clicked');
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
                <GridFilterPanel {...props} />
            </Box>
            <Button
                onClick={handleSearchClick}
                variant="contained"
                color="primary"
                size="small"
                sx={{ margin: "10px" }}
            >
                Search
            </Button>
        </Box>
    );
};

const MuiDataTableComponent = (props) => {
    const { overviewLoading } = useContext(overviewContext)
    const { columns, data, isExport, isLoading } = props;
    const customLocaleText = {
        filterPanelOperator: 'Condition',
    }

    const isLoadingData = overviewLoading

    const [filterModel, setFilterModel] = useState({ items: [] });

    const [columnVisibilityModel, setColumnVisibilityModel] = useState({
        cost_diff: false,
        total_converted_revenue_diff: false,
        troas_diff: false,
        clicks_diff: false,
        total_converted_units_diff: false,
        roas_diff: false,
        roi_diff: false,
        ctr_diff: false,
        views_diff: false,
        cost_pct_change: false,
        total_converted_revenue_pct_change: false,
        clicks_pct_change: false,
        roi_pct_change: false,
        views_pct_change: false,
        aov_pct_change: false,
        cpc_pct_change: false,
        acos_pct_change: false,
        total_sales_diff: false,
        cvr_diff: false,
        orders_diff: false,
        acos_diff: false,
        cpc_diff: false,
        aov_diff: false,
        indirect_sales_diff: false,
        direct_orders_diff: false,
        indirect_orders_diff: false,
        roi_direct_diff: false,
        bsr_change: false,
        spends_change: false,
        direct_revenue_change: false,
        ctr_change: false,
        troas_change: false,
        rating_change: false,
        price_change: false,
        roas_direct_change: false,
        availability_change: false,
        spend_inr_diff: false,
        sales_inr_diff: false,
        impressions_diff: false,
        spend_diff: false,
        sales_diff: false,
        estimated_budget_consumed_diff: false,
        direct_atc_diff: false
    });

    const handleExport = (columns, rows) => {
        const csvContent = [
            columns.map(col => col.headerName).join(','),
            ...rows.map(row =>
                columns.map(col => {
                    let value = row[col.field];
                    if (col.valueGetter) {
                        value = col.valueGetter({ row });
                    }
                    if (typeof value === 'number') {
                        return value;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'export.csv';
        link.click();
    };

    const CustomToolbar = () => (
        <GridToolbarContainer className="w-100 d-flex justify-content-between align-items-center" sx={{ padding: "8px" }}>
            <div>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
            </div>
            {isExport && <ExcelDownloadButton
                handleExport={handleExport}
                columns={columns}
                rows={data}
                buttonClass="excel-button bg-dark text-white border-dark"
                buttonLabel="Export" />}
        </GridToolbarContainer>
    );

    return (
        <Box sx={{ height: "100%", overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {(isLoading || isLoadingData) ? (<CircularProgress />) : (
                <DataGrid
                    rows={data}
                    columns={columns}
                    checkboxSelection
                    disableRowSelectionOnClick
                    filterModel={filterModel}
                    onFilterModelChange={setFilterModel}
                    paginationMode={props.paginationMode || "client"}
                    rowCount={props.rowCount}
                    onPaginationModelChange={props.onPaginationModelChange}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 100,
                            },
                        },
                    }}
                    pageSizeOptions={[100]}
                    slots={{
                        toolbar: CustomToolbar,
                        filterPanel: CustomFilterPanel,
                    }}
                    slotProps={{
                        filterPanel: {
                        },
                        toolbar: { csvOptions: { allColumns: true } }
                    }}
                    localeText={customLocaleText}
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                />
            )}
        </Box>
    );
};

export default MuiDataTableComponent;

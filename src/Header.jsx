import React, { useState, useEffect, useContext } from "react";
import { Dropdown } from "react-bootstrap";
import SelectFieldComponent from "./assets/components/molecules/selectFieldComponent";
import HamburgerMenuIcon from "./assets/icons/header/hamburgerMenuIcon";
import ShareIcon from "./assets/icons/header/shareIcon";
import { OPERATOR } from "./assets/lib/constant/index";
import { useNavigate, useLocation } from "react-router";
import CustomDateRangePicker from "./assets/components/molecules/customDateRangePicker";
import { Box, Button } from "@mui/material";
import overviewContext from "./store/overview/overviewContext";

const Header = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const operatorType = queryParams.get("operator") || "";
  const navigate = useNavigate();
  const location = useLocation();

  const getPageHeading = () => {
    const path = location.pathname.replace("/", "");
    if (path) {
      return path
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return "Performance Overview";
  };

  const { dateRange, formatDate } = useContext(overviewContext) || {
    dateRange: [{ startDate: new Date(), endDate: new Date() }],
  };

  const [showSelectedOperator, setShowSelectedOperator] = useState(
    operatorType ? operatorType : OPERATOR.BLINKIT
  );
  const [showHeaderLogo, setShowHeaderLogo] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    navigate(`${window.location.pathname}?operator=${showSelectedOperator}`);
  }, [showSelectedOperator]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const operatorType = queryParams.get("operator") || OPERATOR.AMAZON;
    setShowSelectedOperator(operatorType);
  }, [location.search]);

  const options = [{ label: "Samsonite", value: "Samsonite" }];

  const onHamburgerClick = () => {
    let sideNavMain = document.getElementsByClassName(
      "left-navbar-main-con"
    )[0];
    let mainContainer = document.getElementsByClassName("main-con")[0];
    let headerContainer = document.getElementsByClassName("header-main-con")[0];

    sideNavMain.classList.value =
      sideNavMain.classList.value === "left-navbar-main-con"
        ? "left-navbar-main-con hide-sidenavbar"
        : "left-navbar-main-con";
    mainContainer.classList.value =
      mainContainer.classList.value === "main-con"
        ? "main-con hide-sidenavbar"
        : "main-con";
    headerContainer.classList.value =
      headerContainer.classList.value === "header-main-con"
        ? "header-main-con hide-sidenavbar"
        : "header-main-con";
    setShowHeaderLogo(!showHeaderLogo);
  };

  return (
    <React.Fragment>
      <div className="header-main-con">
        <div className="icon-heading-con">
          <span className="d-inline-block" onClick={() => onHamburgerClick()}>
            <HamburgerMenuIcon
              iconClass="cursor-pointer"
              iconWidth="20"
              iconHeight="20"
              iconColor="#222e3c"
            />
          </span>
          <div className="card-header">
            <div className="row">
              <div className="col">
                <h1 className="page-heading">{getPageHeading()}</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex actions-con">
          {/*<button className="btn btn-white border h-100">
            <ShareIcon iconWidth="15" iconHeight="15" iconColor="#000" />
  </button>*/}
          <Dropdown className="operator-selected-tab">
            <Dropdown.Toggle variant="white" id="dropdown-basic">
              {showSelectedOperator}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <OperatorList
                showSelectedOperator={showSelectedOperator}
                setShowSelectedOperator={setShowSelectedOperator}
                selectedOperator={OPERATOR.AMAZON} />
             
              
            </Dropdown.Menu>
          </Dropdown>
          <SelectFieldComponent
            isFieldLabelRequired={false}
            areaLabel="user-detail"
            fieldClass={"client-select"}
            isDisabled={true}
            options={options}
            onChange={(e) => setUserCountryData(e.target.value)}
          />
          <div className="col text-end position-relative">
            <Box className="d-inline-flex align-items-center gap-2">
              {/* Toggle Button */}
              <Button
                variant="contained"
                sx={{ color: "#0081ff", background: "#0081ff1a" }}
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                {`${formatDate(dateRange[0].startDate)} - ${formatDate(
                  dateRange[0].endDate
                )}`}
              </Button>
            </Box>
            {showDatePicker && (
              <Box className="date-range-container">
                <CustomDateRangePicker onClose={() => setShowDatePicker(false)} />
              </Box>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const OperatorList = (props) => {
  const { setShowSelectedOperator, selectedOperator } =
    props;
  return (
    <Dropdown.Item onClick={() => setShowSelectedOperator(selectedOperator)}>
      {selectedOperator}
    </Dropdown.Item>
  );
};

export default Header;

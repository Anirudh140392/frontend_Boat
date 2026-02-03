import React from "react";

const BoatIcon = ({ iconClass, iconWidth, iconHeight }) => {
  return (
    <svg
      className={iconClass}
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black circle */}
      <circle cx="60" cy="60" r="58" fill="#000" />

      {/* Logo */}
      <g transform="translate(12, 60)">
        {/* b — FIXED */}
        <path
          d="
            M 0 -22
            L 0 22
            L 6 22
            L 6 14
            C 6 18 10 22 16 22
            C 24 22 28 16 28 8
            C 28 0 24 -6 16 -6
            C 10 -6 6 -2 6 2
            L 6 -22
            Z

            M 6 8
            C 6 2 10 0 14 0
            C 18 0 22 2 22 8
            C 22 14 18 16 14 16
            C 10 16 6 14 6 8
            Z
          "
          fill="#FFFFFF"
        />

        {/* o */}
        <path
          d="
            M 32 8
            C 32 18 38 22 44 22
            C 50 22 56 18 56 8
            C 56 -2 50 -6 44 -6
            C 38 -6 32 -2 32 8
            Z
            M 38 8
            C 38 4 40 2 44 2
            C 48 2 50 4 50 8
            C 50 12 48 14 44 14
            C 40 14 38 12 38 8
            Z
          "
          fill="#FFFFFF"
        />

        {/* A */}
        <path
          d="M 60 22 L 70 -6 L 80 22 L 74 22 L 70 8 L 66 22 Z"
          fill="#E63946"
        />

        {/* t */}
        <path
          d="
            M 84 22
            L 84 4
            L 80 4
            L 80 0
            L 84 0
            L 84 -10
            L 90 -10
            L 90 0
            L 96 0
            L 96 4
            L 90 4
            L 90 14
            C 90 16 92 18 94 18
            L 96 18
            L 96 22
            L 92 22
            C 87 22 84 18 84 14
            Z
          "
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
};

export default BoatIcon;

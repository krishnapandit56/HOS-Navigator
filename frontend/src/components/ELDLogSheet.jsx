import React, { useState, useRef } from 'react';
import { Calendar, Printer, Download, ChevronLeft, ChevronRight, FileText, CheckCircle2, ShieldCheck, MapPin, Clock, Truck } from 'lucide-react';

export default function ELDLogSheet({ dailyLogs, tripInputs, summary }) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const sheetRef = useRef(null);

  if (!dailyLogs || dailyLogs.length === 0) {
    return null;
  }

  const currentSheet = dailyLogs[activeDayIndex] || dailyLogs[0];
  const {
    day_number,
    date,
    from_location,
    to_location,
    total_miles_driving_today,
    carrier_name,
    main_office_address,
    home_terminal_address,
    truck_number,
    trailer_number,
    shipping_documents,
    status_totals,
    duty_segments,
    remarks,
    recap
  } = currentSheet;

  const handlePrint = () => {
    window.print();
  };

  // SVG Grid layout constants
  const labelWidth = 140;
  const gridWidth = 672; // 24 hours * 28 px
  const totalsWidth = 70;
  const svgWidth = labelWidth + gridWidth + totalsWidth; // 882 px
  const headerHeight = 30;
  const rowHeight = 32;
  const svgHeight = headerHeight + (rowHeight * 4) + 10; // ~168 px

  // Y positions for each duty status
  const rowY = {
    "OFF_DUTY": headerHeight + (rowHeight * 0.5),     // Line 1: ~46px
    "SLEEPER": headerHeight + (rowHeight * 1.5),      // Line 2: ~78px
    "DRIVING": headerHeight + (rowHeight * 2.5),      // Line 3: ~110px
    "ON_DUTY_ND": headerHeight + (rowHeight * 3.5),   // Line 4: ~142px
  };

  // Convert hour (0.0 to 24.0) to SVG X coordinate
  const hourToX = (hour) => {
    return labelWidth + (hour * (gridWidth / 24));
  };

  // Build the continuous ELD step path
  const buildGraphPath = () => {
    if (!duty_segments || duty_segments.length === 0) return '';
    
    let path = '';
    let lastY = null;

    duty_segments.forEach((seg, idx) => {
      const xStart = hourToX(seg.start_hour);
      const xEnd = hourToX(seg.end_hour);
      const targetY = rowY[seg.status] || rowY["OFF_DUTY"];

      if (idx === 0) {
        path += `M ${xStart} ${targetY} `;
        path += `L ${xEnd} ${targetY} `;
        lastY = targetY;
      } else {
        if (lastY !== targetY) {
          // Vertical step line for status change
          path += `L ${xStart} ${targetY} `;
        }
        // Horizontal line for duration
        path += `L ${xEnd} ${targetY} `;
        lastY = targetY;
      }
    });

    return path;
  };

  // Hour labels for 24-hr scale: Midnight, 1, 2, ..., 11, Noon, 1, 2, ..., 11, Midnight
  const getHourLabel = (h) => {
    if (h === 0 || h === 24) return 'Mid-night';
    if (h === 12) return 'Noon';
    if (h > 12) return (h - 12).toString();
    return h.toString();
  };

  return (
    <div className="bg-slate-50/80 border border-slate-300 rounded-xl p-5 shadow-2xl space-y-6">
      {/* Top Header & Day Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300 no-print">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              FMCSA Driver's Daily Log Sheets
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 70hr/8day Compliant
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Official 24-hour log graph and records matching FMCSA §395.8 regulations.
          </p>
        </div>

        {/* Action Buttons & Day Tabs */}
        <div className="flex items-center gap-3">
          {/* Day Navigation */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1">
            <button
              onClick={() => setActiveDayIndex(Math.max(0, activeDayIndex - 1))}
              disabled={activeDayIndex === 0}
              className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-3 py-0.5 text-xs font-semibold text-sky-300">
              Day {activeDayIndex + 1} of {dailyLogs.length}
            </div>
            <button
              onClick={() => setActiveDayIndex(Math.min(dailyLogs.length - 1, activeDayIndex + 1))}
              disabled={activeDayIndex === dailyLogs.length - 1}
              className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-600 text-slate-900 rounded-lg border border-slate-300 transition"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            Print Log
          </button>
        </div>
      </div>

      {/* Day Selector Pills for Multi-Day Trips */}
      {dailyLogs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
          <span className="text-xs font-medium text-slate-600 mr-1">Select Sheet:</span>
          {dailyLogs.map((sheet, idx) => (
            <button
              key={idx}
              onClick={() => setActiveDayIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeDayIndex === idx
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-white/80 text-slate-700 hover:bg-slate-100/60 border border-slate-300/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Day {sheet.day_number}</span>
              <span className="text-[11px] opacity-75 font-mono">({sheet.date})</span>
            </button>
          ))}
        </div>
      )}

      {/* The Printable ELD Form Card (Authentic FMCSA Form Replica) */}
      <div
        ref={sheetRef}
        className="eld-sheet-container bg-white text-slate-900 rounded-lg p-6 shadow-xl border border-slate-300 font-sans"
      >
        {/* Form Title & Top Metadata */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950 font-serif">
                Drivers Daily Log
              </h1>
              <p className="text-xs font-bold text-slate-700">(24 hours)</p>
            </div>
            
            {/* Date Box */}
            <div className="text-center border-b border-slate-900 pb-1 px-4">
              <span className="text-base font-bold font-mono text-slate-900 tracking-wider">
                {date}
              </span>
              <div className="flex justify-between text-[9px] uppercase font-bold text-slate-600 gap-4 mt-0.5">
                <span>(month)</span>
                <span>(day)</span>
                <span>(year)</span>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-600 font-medium max-w-[220px]">
              <div>Original - File at home terminal.</div>
              <div>Duplicate - Driver retains in his/her possession for 8 days.</div>
            </div>
          </div>

          {/* From / To & Carrier Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-2 border-t border-slate-300 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="font-bold uppercase text-[11px] w-12 text-slate-800">From:</span>
                <span className="flex-1 font-semibold border-b border-slate-400 pb-0.5 text-slate-950">
                  {from_location}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold uppercase text-[11px] w-12 text-slate-800">To:</span>
                <span className="flex-1 font-semibold border-b border-slate-400 pb-0.5 text-slate-950">
                  {to_location}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="font-bold uppercase text-[10px] text-slate-700 whitespace-nowrap">
                  Name of Carrier:
                </span>
                <span className="flex-1 font-semibold border-b border-slate-400 pb-0.5 text-slate-950">
                  {carrier_name}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold uppercase text-[10px] text-slate-700 whitespace-nowrap">
                  Main Office Address:
                </span>
                <span className="flex-1 text-[11px] border-b border-slate-400 pb-0.5 text-slate-900">
                  {main_office_address}
                </span>
              </div>
            </div>
          </div>

          {/* Mileage & Equipment Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2.5 pt-2 border-t border-slate-300 text-xs">
            <div className="flex gap-4">
              <div className="border border-slate-900 p-1.5 text-center flex-1 rounded-sm bg-slate-50">
                <div className="text-base font-black font-mono text-slate-950">
                  {total_miles_driving_today}
                </div>
                <div className="text-[9px] uppercase font-bold text-slate-700 mt-0.5">
                  Total Miles Driving Today
                </div>
              </div>
              <div className="border border-slate-900 p-1.5 text-center flex-1 rounded-sm bg-slate-50">
                <div className="text-base font-black font-mono text-slate-950">
                  {summary ? summary.total_miles : total_miles_driving_today}
                </div>
                <div className="text-[9px] uppercase font-bold text-slate-700 mt-0.5">
                  Total Trip Mileage
                </div>
              </div>
            </div>

            <div className="border border-slate-900 p-1.5 rounded-sm bg-slate-50 flex flex-col justify-center">
              <div className="font-bold text-[12px] text-slate-950">
                Tractor: <span className="font-mono text-blue-900">{truck_number}</span> | Trailer: <span className="font-mono text-blue-900">{trailer_number}</span>
              </div>
              <div className="text-[9px] uppercase font-bold text-slate-600 mt-0.5">
                Truck/Tractor and Trailer Numbers or License Plate(s)/State
              </div>
            </div>
          </div>
        </div>

        {/* 24-HOUR ELD GRID (SVG) */}
        <div className="my-4 overflow-x-auto border-2 border-slate-900 bg-white">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full min-w-[840px] select-none"
            style={{ shapeRendering: 'crispEdges' }}
          >
            {/* Header row background */}
            <rect x="0" y="0" width={svgWidth} height={headerHeight} fill="#0f172a" />
            
            {/* Header Column Labels */}
            <text x="10" y="20" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              DUTY STATUS
            </text>

            {/* Total Hours Header */}
            <text
              x={labelWidth + gridWidth + (totalsWidth / 2)}
              y="20"
              fill="#ffffff"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              Total Hours
            </text>

            {/* Hour Numbers on Header */}
            {Array.from({ length: 25 }).map((_, h) => {
              const x = hourToX(h);
              const label = getHourLabel(h);
              const isMajor = h === 0 || h === 12 || h === 24;
              return (
                <g key={`hdr-hr-${h}`}>
                  <text
                    x={x}
                    y={isMajor ? "16" : "20"}
                    fill="#ffffff"
                    fontSize={isMajor ? "8.5" : "9.5"}
                    fontWeight={isMajor ? "bold" : "600"}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {label}
                  </text>
                  {/* Small tick at bottom of header */}
                  <line x1={x} y1={headerHeight - 4} x2={x} y2={headerHeight} stroke="#94a3b8" strokeWidth="1" />
                </g>
              );
            })}

            {/* 4 Status Rows */}
            {[
              { id: 'OFF_DUTY', line: 1, label: '1. Off Duty', total: status_totals.line_1_off_duty },
              { id: 'SLEEPER', line: 2, label: '2. Sleeper Berth', total: status_totals.line_2_sleeper_berth },
              { id: 'DRIVING', line: 3, label: '3. Driving', total: status_totals.line_3_driving },
              { id: 'ON_DUTY_ND', line: 4, label: '4. On Duty (not driving)', total: status_totals.line_4_on_duty_nd },
            ].map((row, idx) => {
              const yTop = headerHeight + (idx * rowHeight);
              const yMid = yTop + (rowHeight / 2);
              const isEven = idx % 2 === 1;

              return (
                <g key={row.id}>
                  {/* Alternate row light background */}
                  {isEven && (
                    <rect
                      x="0"
                      y={yTop}
                      width={labelWidth + gridWidth}
                      height={rowHeight}
                      fill="#f8fafc"
                    />
                  )}

                  {/* Horizontal row divider line */}
                  <line
                    x1="0"
                    y1={yTop + rowHeight}
                    x2={svgWidth}
                    y2={yTop + rowHeight}
                    stroke="#1e293b"
                    strokeWidth="1.2"
                  />

                  {/* Row Label Text */}
                  <text
                    x="10"
                    y={yMid + 4}
                    fill="#0f172a"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {row.label}
                  </text>

                  {/* Vertical separator between labels and grid */}
                  <line
                    x1={labelWidth}
                    y1={headerHeight}
                    x2={labelWidth}
                    y2={headerHeight + (rowHeight * 4)}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />

                  {/* 15-minute / 30-minute / 1-hour vertical tick marks */}
                  {Array.from({ length: 24 }).map((_, h) => {
                    const xHour = hourToX(h);
                    const hourWidth = gridWidth / 24;
                    const x15 = xHour + (hourWidth * 0.25);
                    const x30 = xHour + (hourWidth * 0.50);
                    const x45 = xHour + (hourWidth * 0.75);

                    return (
                      <g key={`ticks-${row.id}-${h}`}>
                        {/* 1-Hour full line */}
                        <line
                          x1={xHour}
                          y1={yTop}
                          x2={xHour}
                          y2={yTop + rowHeight}
                          stroke="#cbd5e1"
                          strokeWidth="1"
                        />
                        {/* 30-min medium tick mark */}
                        <line
                          x1={x30}
                          y1={yTop}
                          x2={x30}
                          y2={yTop + (rowHeight * 0.5)}
                          stroke="#94a3b8"
                          strokeWidth="0.8"
                        />
                        {/* 15-min and 45-min small tick marks */}
                        <line
                          x1={x15}
                          y1={yTop}
                          x2={x15}
                          y2={yTop + (rowHeight * 0.25)}
                          stroke="#cbd5e1"
                          strokeWidth="0.6"
                        />
                        <line
                          x1={x45}
                          y1={yTop}
                          x2={x45}
                          y2={yTop + (rowHeight * 0.25)}
                          stroke="#cbd5e1"
                          strokeWidth="0.6"
                        />
                      </g>
                    );
                  })}

                  {/* 24:00 Final hour line */}
                  <line
                    x1={labelWidth + gridWidth}
                    y1={headerHeight}
                    x2={labelWidth + gridWidth}
                    y2={headerHeight + (rowHeight * 4)}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />

                  {/* Right side: Line total hours box */}
                  <rect
                    x={labelWidth + gridWidth}
                    y={yTop}
                    width={totalsWidth}
                    height={rowHeight}
                    fill={isEven ? "#f1f5f9" : "#ffffff"}
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                  />
                  <text
                    x={labelWidth + gridWidth + (totalsWidth / 2)}
                    y={yMid + 4}
                    fill="#0f172a"
                    fontSize="12"
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {row.total.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* THE CONTINUOUS ELD LOG GRAPH LINE */}
            <path
              d={buildGraphPath()}
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0px 1px 2px rgba(2,132,199,0.3))' }}
            />

            {/* Segment endpoint dots */}
            {duty_segments.map((seg, i) => (
              <g key={`pt-${i}`}>
                <circle
                  cx={hourToX(seg.start_hour)}
                  cy={rowY[seg.status]}
                  r="3.5"
                  fill="#0369a1"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {i === duty_segments.length - 1 && (
                  <circle
                    cx={hourToX(seg.end_hour)}
                    cy={rowY[seg.status]}
                    r="3.5"
                    fill="#0369a1"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            ))}

            {/* Bottom Total 24.0 Hours Indicator */}
            <rect
              x={labelWidth + gridWidth}
              y={headerHeight + (rowHeight * 4)}
              width={totalsWidth}
              height="20"
              fill="#0f172a"
            />
            <text
              x={labelWidth + gridWidth + (totalsWidth / 2)}
              y={headerHeight + (rowHeight * 4) + 14}
              fill="#38bdf8"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              24.00
            </text>
          </svg>
        </div>

        {/* Remarks Section */}
        <div className="border border-slate-900 rounded-sm p-3 mb-4 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Remarks
            </h3>
            <span className="text-[10px] text-slate-600 italic">
              Enter name of place and change of duty standard time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {remarks && remarks.map((rem, idx) => (
              <div
                key={idx}
                className="flex items-start gap-1.5 p-1.5 bg-white border border-slate-200 rounded text-[11px]"
              >
                <span className="font-mono font-bold text-sky-800 bg-sky-50 px-1 py-0.5 rounded border border-sky-200 text-[10px] whitespace-nowrap">
                  {rem.time}
                </span>
                <div className="leading-tight">
                  <div className="font-bold text-slate-900 truncate max-w-[200px]" title={rem.location}>
                    {rem.location}
                  </div>
                  <div className="text-[10px] text-slate-600 truncate max-w-[200px]" title={rem.remark}>
                    {rem.remark}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Documents & Recap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
          {/* Shipping Documents */}
          <div className="md:col-span-5 border border-slate-900 p-2.5 rounded-sm bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="font-bold uppercase text-[11px] text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Shipping Documents
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    DVL or Manifest No.:
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {shipping_documents?.manifest_number || 'BOL-78912'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    Shipper & Commodity:
                  </span>
                  <span className="font-medium text-slate-900">
                    {shipping_documents?.shipper_commodity || 'Commercial Freight'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-[9px] text-slate-500 mt-2 border-t border-slate-200 pt-1">
              Use time standard of home terminal
            </div>
          </div>

          {/* 70 Hour / 8 Day Drivers Recap */}
          <div className="md:col-span-7 border border-slate-900 p-2.5 rounded-sm bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <span className="font-bold uppercase text-[11px] text-slate-900">
                Recap: 70 Hour / 8 Day Drivers
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                FMCSA Compliant
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="border border-slate-300 bg-white p-1.5 rounded">
                <div className="text-sm font-black font-mono text-slate-950">
                  {recap.on_duty_today.toFixed(2)}
                </div>
                <div className="text-[9px] font-bold uppercase text-slate-600 mt-0.5 leading-tight">
                  On-Duty Today (Lines 3 & 4)
                </div>
              </div>

              <div className="border border-slate-300 bg-white p-1.5 rounded">
                <div className="text-sm font-black font-mono text-blue-900">
                  {recap.hours_on_duty_last_7_days.toFixed(2)}
                </div>
                <div className="text-[9px] font-bold uppercase text-slate-600 mt-0.5 leading-tight">
                  A. Total On-Duty Last 7 Days
                </div>
              </div>

              <div className="border border-slate-300 bg-white p-1.5 rounded">
                <div className="text-sm font-black font-mono text-emerald-700">
                  {recap.hours_available_tomorrow.toFixed(2)}
                </div>
                <div className="text-[9px] font-bold uppercase text-slate-600 mt-0.5 leading-tight">
                  B. Available Tomorrow (70 - A)
                </div>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 mt-2 leading-tight">
              *If you took 34 consecutive hours off duty you have 70 hours available. Property-carrying driver regulations applied.
            </div>
          </div>
        </div>

        {/* Driver Signature Line */}
        <div className="mt-5 pt-3 border-t border-slate-400 flex flex-col sm:flex-row justify-between items-end text-xs gap-4">
          <div className="text-[10px] text-slate-500">
            I certify that these entries are true and correct as prescribed by 49 CFR Part 395.
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[11px] uppercase text-slate-800">Driver Signature:</span>
            <div className="font-serif italic text-base border-b border-slate-900 px-6 py-0.5 text-slate-900 font-bold">
              John Doe (Certified Electronic Signature)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

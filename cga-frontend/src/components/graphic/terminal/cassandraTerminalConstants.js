export default {
  dummyCQL: [
    { lineNumber: 0, lineContent: "cqlsh >> DESCRIBE keyspaces;" },
    { lineNumber: 1, lineContent: "cqlsh >> TODO: response" },
    { lineNumber: 2, lineContent: "cqlsh >> USE daily_weather_measurements;" },
    {
      lineNumber: 3,
      lineContent:
        "cqlsh >> SELECT m_date , city , station_code, min_temp , max_temp",
    },
    { lineNumber: 4, lineContent: "      >> FROM daily_weather_measurements" },
    { lineNumber: 5, lineContent: "      >> WHERE m_date ='2020-01-12'" },
    { lineNumber: 6, lineContent: "      >> ORDER BY city ASC;" },
  ],
  starterCQL: [{ lineNumber: 0, lineContent: "cqlsh >> " }],
};

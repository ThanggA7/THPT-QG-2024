const axios = require("axios");
const fs = require("fs");
const { performance } = require("perf_hooks");

const start_sbd = 1000001;
const end_sbd = 64006937;
const apiUrl = "https://dantri.com.vn/thpt/1/0/99";

const totalSbd = end_sbd - start_sbd + 1;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const crawlData = async (sbd) => {
  try {
    const url = `${apiUrl}/${sbd}/2024/0.2/search-gradle.htm`;
    const response = await axios.get(url);

    if (response.status === 200) {
      const jsonData = response.data;
      if (jsonData && jsonData.student) {
        const studentData = jsonData.student;

        const rowData = {
          sbd: studentData.sbd,
          toan: studentData.toan,
          van: studentData.van,
          ngoaiNgu: studentData.ngoaiNgu,
          vatLy: studentData.vatLy,
          hoaHoc: studentData.hoaHoc,
          sinhHoc: studentData.sinhHoc,
          diemTBTuNhien: studentData.diemTBTuNhien,
          lichSu: studentData.lichSu,
          diaLy: studentData.diaLy,
          gdcd: studentData.gdcd,
          diemTBXaHoi: studentData.diemTBXaHoi,
        };
        return rowData;
      }
    }
  } catch (error) {
    console.error(`[CRAWL] ${sbd} không thành công:`, error.message);
  }
  return null;
};

const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const main = async () => {
  let results = [];
  const startTime = performance.now();

  for (let sbd = start_sbd; sbd <= end_sbd; sbd++) {
    const data = await crawlData(sbd);
    if (data) {
      results.push(data);
      console.log(`[CRAWL] ${sbd} thành công`);
    }

    const currentIndex = sbd - start_sbd + 1;
    const progress = (currentIndex / totalSbd) * 100;
    const elapsedTime = performance.now() - startTime;
    const estimatedTotalTime = (elapsedTime / currentIndex) * totalSbd;
    const estimatedTimeRemaining = estimatedTotalTime - elapsedTime;

    console.log(`Progress: ${progress.toFixed(2)}%`);
    console.log(`Elapsed Time: ${formatTime(elapsedTime)}`);
    console.log(
      `Estimated Time Remaining: ${formatTime(estimatedTimeRemaining)}`
    );

    if (sbd % 1000 === 0 || sbd === end_sbd) {
      fs.writeFileSync("results.json", JSON.stringify(results, null, 2));
      console.log(`Saved data for SBD up to ${sbd}`);
    }

    await delay(100);
  }

  const totalTime = performance.now() - startTime;
  console.log(`Total Elapsed Time: ${formatTime(totalTime)}`);
};

main();

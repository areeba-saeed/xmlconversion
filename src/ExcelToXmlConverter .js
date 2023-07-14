import React, { useState } from "react";
import * as XLSX from "xlsx";
import xmlbuilder from "xmlbuilder";
import { TailSpin } from "react-loader-spinner";
import Image from "./assets/download.jfif";

const ExcelToXmlConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [downloadLink, setDownloadLink] = useState(null);
  const [step1, setStep1] = useState(true);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleConvert = () => {
    if (!selectedFile) {
      console.log("No file selected.");
      return;
    }

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        setConversionProgress(progress);
        setStep1(false);
      }
    };

    reader.onload = (event) => {
      // Simulate a delay of 3 seconds to show progress
      setTimeout(() => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Assuming the first sheet is to be converted
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Create XML root element
        const root = xmlbuilder.create("root");

        // Iterate over the rows and columns
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowElement = root.ele("row");

          for (let j = 0; j < row.length; j++) {
            const cellValue = row[j];
            rowElement.ele(`column${j}`, cellValue);
          }
        }

        // Generate XML string
        const xmlString = root.end({ pretty: true });

        // Create a Blob object from the XML string
        const blob = new Blob([xmlString], { type: "application/xml" });

        // Create a download link
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = "converted.xml";

        // Store the download link in state
        setDownloadLink(downloadLink);
        // Reset the progress bar
        setConversionProgress(0);
      }, 3000);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDownload = () => {
    if (downloadLink) {
      // Click the download link to trigger the download
      downloadLink.click();
      setStep1(true);
      setDownloadLink(null);
      setConversionProgress(0);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <h1>Convert Excel to XML</h1>
      <div className="container">
        <div
          className="sub-container"
          style={
            step1 ? {} : { backgroundColor: "rgba(241, 237, 237, 0.815)" }
          }>
          <div className="sub-container-1">
            <label className="file-input-label">
              <input
                type="file"
                className="file-input"
                onChange={handleFileChange}
                disabled={step1 ? false : true}
              />
              {selectedFile ? (
                <span className="file-placeholder">{selectedFile.name}</span>
              ) : (
                <span className="file-placeholder">Upload excel file</span>
              )}
            </label>
          </div>
          <button
            className="btn-change"
            onClick={handleConvert}
            style={step1 ? { cursor: "pointer" } : {}}
            disabled={step1 ? false : true}>
            Convert to XML
          </button>
        </div>
        <div
          className="sub-container"
          style={
            conversionProgress
              ? {}
              : { backgroundColor: "rgba(241, 237, 237, 0.815)" }
          }>
          <div className="sub-container-1">
            {conversionProgress ? (
              <TailSpin
                color="rgb(155, 236, 34)"
                height={70}
                width={70}
                timeout={5000}
              />
            ) : (
              <p>XML</p>
            )}
          </div>
          {conversionProgress ? <p>Converting...</p> : <p>Converted</p>}
        </div>
        <div
          className="sub-container"
          style={
            downloadLink
              ? {}
              : { backgroundColor: "rgba(241, 237, 237, 0.815)" }
          }>
          <div className="sub-container-1">
            {!downloadLink ? <p>Convert now</p> : <img src={Image} />}
          </div>
          <button
            className="btn-change"
            onClick={handleDownload}
            style={downloadLink ? { cursor: "pointer" } : {}}
            disabled={downloadLink ? false : true}>
            Download XML
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelToXmlConverter;

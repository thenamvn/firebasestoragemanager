import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDropzone } from "react-dropzone";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import UploadListItem from "./UploadListItem";
import { storage } from "./../firebase/firebase";

const uploadToStorage = async (file,setProgress) => {
  const fileName = `${file.name}`;

  const upload = new Promise((resolve, reject) => {
    if (!file) {
      return reject({
        status: "File not found"
      });
    }
    const uploadTask = storage.ref("/").child(`${fileName}`);
    uploadTask.put(file).on(
      "state_changed",
      function(snapshot) {
        let progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(progress));
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log(`Upload is running for ${file.name}`);
            break;
          default:
            console.log("Default mod");
        }
      },
      function(error) {
        reject({
          status: "error",
          errorMessage: "File not uploaded"
        });
      },
      function() {
        resolve({
          status: "success",
          fileName,
          originalName: file.name
        });
      }
    );
  });
  return upload;
};


const FileUpload = ({ showFileUpload }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);


  const deleteFile = fileName => {
    const updatedFiles = files.filter(file => fileName !== file.name);
    setFiles(updatedFiles);
  };

  const renderFiles = files => {
    if (files.length === 0) {
      return [];
    }

    return files.map(file => (
      <UploadListItem key={file.name} file={file} deleteFile={deleteFile} />
    ));
  };

  useEffect(() => {
    console.log("getting files");
  }, [files]);

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    await Promise.all(
      files.map(async file => {
        try {
          const startUpload = await uploadToStorage(file,setProgress);
          if (startUpload.status === "success") {
          }
        } catch (err) {
          setError(true);
        }
      })
    );
    setFiles([]);
  };
  return (
    <div className="file-upload">
      <div className="file-upload--header">
        <span className="file-upload--title">Upload Files</span>
        <span className="file-upload--close">
          <FontAwesomeIcon
            icon={faTimes}
            color="#666"
            onClick={showFileUpload}
          />
        </span>
      </div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="dropzone__active">Drop the files here ...</p>
        ) : (
          <p className="dropzone">
            Kéo 'và' thả một số tệp vào đây hoặc nhấp để chọn tệp
          </p>
        )}
      </div>
      {renderFiles(files)}

      {files.length > 0 && (
        <><button className="button" onClick={handleUpload}>
          Upload File(s)
        </button>
        <div>Tiến trình tải lên: {progress}%</div></>
      )}

      {error && (
        <span style={{ fontSize: "12px", color: "red" }}>
          Lỗi tải lên
        </span>
      )}
    </div>
  );
};

export default FileUpload;

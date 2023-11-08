import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AccordianContainer from "../CustomComponents/AccordianContainer";
import CustomConfirmationDialog from "../CustomComponents/CustomConfirmationDialog";
import CustomDropDown from "../CustomComponents/CustomDropDown";
import CustomTextField from "../CustomComponents/CustomTextField";
import { DynamicReportReducerAction } from "../Store/DynamicReport/DynamicReportReducer";
import VariablesDialog from "./VariablesDialog";

import CustomAutoComplete from "../CustomComponents/CustomAutoComplete";

const TextEditor = () => {
  let newAxiosBase = { ...axios };
  newAxiosBase.defaults.baseURL = process.env.REACT_APP_STLAP_LMS_BACKEND;

  const dispatch = useDispatch();

  const userName = useSelector((state) => state.branch.userName);

  const reportScreen = useSelector(
    (state) => state.letterGeneration.reportScreen
  );

  const snackBarHandler = useSelector(
    (state) => state.letterGeneration.snackBarHandler
  );

  const { vertical, horizontal } = snackBarHandler.snackBarState;

  const openAlertHandler = () => {
    dispatch(DynamicReportReducerAction.updateSnackBarAlert(true));
  };

  const closeAlertHandler = () => {
    dispatch(DynamicReportReducerAction.updateSnackBarAlert(false));
  };

  const editorRef = useRef(null);
  const save = async () => {
    axios.defaults.baseURL =
      process.env.REACT_APP_STLAP_LETTER_GENERATION_BACKEND;
    if (editorRef.current) {
      try {
        dispatch(DynamicReportReducerAction.updateLoading(true));
        if (!reportScreen.reportList.includes(reportScreen.templateName)) {
          var dataList = [...reportScreen.reportList];
          dataList.push(reportScreen.templateName);
          dispatch(DynamicReportReducerAction.updateReportList(dataList));
        }
        const response = await axios.post("/dynamicTemplate/saveTemplate", {
          templateHeaderKey: reportScreen.templateHeaderKey,
          templateName: reportScreen.templateName,
          templateKey: reportScreen.templateKey,
          content: editorRef.current.getContent(),
          active: reportScreen.active,
          userName: userName,
          mode: reportScreen.mode,
        });

        if (response.status === 200) {
          if (response.data.toString().startsWith("Error")) {
            dispatch(
              DynamicReportReducerAction.updateSnackBarMessage(response.data)
            );
            dispatch(
              DynamicReportReducerAction.updateSnackBarAlertType("error")
            );
            openAlertHandler();
            dispatch(DynamicReportReducerAction.updateLoading(false));
          } else {
            editorRef.current.setContent("");
            dispatch(DynamicReportReducerAction.resetReportScreen());
            dispatch(
              DynamicReportReducerAction.updateSnackBarMessage(response.data)
            );
            dispatch(
              DynamicReportReducerAction.updateSnackBarAlertType("success")
            );
            openAlertHandler();
            setTimeout(() => {
              dispatch(DynamicReportReducerAction.updateLoading(false));
              //window.location.reload();
            }, 1000);
          }
        }
      } catch {}
    }
  };

  const getTemplateKey = async (value, mode) => {
    axios.defaults.baseURL =
      process.env.REACT_APP_STLAP_LETTER_GENERATION_BACKEND;
    dispatch(DynamicReportReducerAction.updateLoading(true));
    const response = await axios.post("/dynamicTemplate/getTemplateKey", {
      templateName: value,
    });
    if (response.status === 200) {
      var key = "";
      if (mode === "NEW") {
        key = response.data.length + 1;
      }
      dispatch(
        DynamicReportReducerAction.updateTemplateKeys({
          templateKey: key,
          templateKeyList: response.data,
        })
      );
      dispatch(DynamicReportReducerAction.updateLoading(false));
    }
  };

  const getContent = async () => {
    axios.defaults.baseURL =
      process.env.REACT_APP_STLAP_LETTER_GENERATION_BACKEND;
    dispatch(DynamicReportReducerAction.updateLoading(true));
    const response = await axios.post("/dynamicTemplate/getTemplate", {
      templateName: reportScreen.templateName,
      templateKey: reportScreen.templateKey,
    });
    if (response.status === 200) {
      editorRef.current.setContent(response.data.content);
      dispatch(
        DynamicReportReducerAction.updateTemplateHeaderKeyAndActive({
          templateHeaderKey: response.data.templateHeaderKey,
          active: response.data.active,
        })
      );

      dispatch(DynamicReportReducerAction.updateLoading(false));
      dispatch(
        DynamicReportReducerAction.updateSnackBarMessage(
          "Template Content Fetched Successfully.."
        )
      );
      dispatch(DynamicReportReducerAction.updateSnackBarAlertType("success"));
      dispatch(DynamicReportReducerAction.updatedataFetched(true));
      openAlertHandler();
      setTimeout(() => {
        closeAlertHandler();
      }, 1000);
    }
  };

  const getVariablesList = async (templateName) => {
    axios.defaults.baseURL =
      process.env.REACT_APP_STLAP_LETTER_GENERATION_BACKEND;
    dispatch(DynamicReportReducerAction.updateLoading(true));
    const response = await axios.post("/dynamicTemplate/getVariablesList", {
      templateName: templateName,
    });
    if (response.status === 200) {
      dispatch(DynamicReportReducerAction.updateVariablesList(response.data));
      dispatch(DynamicReportReducerAction.updateLoading(false));
    }
  };

  const getTemplateNameList = async () => {
    axios.defaults.baseURL =
      process.env.REACT_APP_STLAP_LETTER_GENERATION_BACKEND;
    dispatch(DynamicReportReducerAction.updateLoading(true));
    const response = await axios.post("/dynamicTemplate/getTemplateNameList");
    if (response.status === 200) {
      dispatch(DynamicReportReducerAction.updateReportList(response.data));
      dispatch(DynamicReportReducerAction.updateLoading(false));
    }
  };
  const [mode, setMode] = useState([]);
  const [applicaitonCodeList, setApplicationCodeList] = useState([
    "STLAP",
    "HOMEFIN",
  ]);
  const [applicaitonCode, setApplicationCode] = useState("");
  useEffect(() => {
    getLovMasterData();

    getTemplateNameList();
    getVariablesList();

    return () => {
      dispatch(DynamicReportReducerAction.resetReportScreen());
    };
  }, []);
  // Load values from the LOV Master API.
  const getLovMasterData = async () => {
    const letterGenerationLovData = await newAxiosBase.post(
      "/lovMaster/getLovValues",
      {
        // moduleid to be given on special access level based on that  will update here.
        moduleId: "MD018",
      }
    );
    const lovData = letterGenerationLovData.data;
    const modes = lovData?.["Mode"].map((record) => {
      return {
        key: record.lovValues,
        value: record.lovValues,
        text: record.lovValues,
      };
    });
    setMode(modes);
  };
  if (
    reportScreen.templateName === "" ||
    reportScreen.templateKey === "" ||
    reportScreen.mode === "" ||
    reportScreen.mode === "NEW"
  ) {
    dispatch(DynamicReportReducerAction.updateFetchButtonDisable(true));
  } else {
    dispatch(DynamicReportReducerAction.updateFetchButtonDisable(false));
  }

  if (
    reportScreen.templateName === "" ||
    reportScreen.templateKey === "" ||
    reportScreen.mode === "" ||
    (!reportScreen.dataFetched && reportScreen.mode !== "NEW")
  ) {
    dispatch(DynamicReportReducerAction.updateSaveButtonDisable(true));
    dispatch(DynamicReportReducerAction.updateSendMailButtonDisable(true));
  } else {
    dispatch(DynamicReportReducerAction.updateSaveButtonDisable(false));
    if (reportScreen.mode === "NEW")
      dispatch(DynamicReportReducerAction.updateSendMailButtonDisable(true));
    else
      dispatch(DynamicReportReducerAction.updateSendMailButtonDisable(false));
  }

  const handleRenderInput = (params) => (
    <TextField
      {...params}
      placeholder="Select/Create Template Name"
      variant="standard"
      onChange={(event, value) =>
        dispatch(
          DynamicReportReducerAction.updateTemplateName(event.target.value)
        )
      }
      InputProps={{
        ...params.InputProps,
        type: "search",
      }}
    />
  );

  return (
    <>
      {reportScreen.loading && (
        <>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        </>
      )}
      <AccordianContainer
        id="accord"
        title="Letter Template Creation"
        initialOpen={true}
        sx={{ margin: "8px !important" }}
      >
        <Box sx={{ marginTop: "-1%" }}>
          <Grid container rowSpacing={0} columnSpacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={2} xl={3}>
              <CustomDropDown
                label="Application Type"
                required={true}
                dropDownValue={applicaitonCodeList}
                variant="standard"
                value={applicaitonCode}
                onChange={(event) => {
                  setApplicationCode(event.target.value);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2} xl={3}>
              <InputLabel
                size="small"
                sx={{
                  color: "#004A92",
                  mb: 2,
                  fontWeight: 400,
                  fontSize: "14px",
                }}
              >
                {"Select/Create Template Name"}
              </InputLabel>
              <Autocomplete
                sx={{}}
                freeSolo
                disableClearable
                id="createtempalte"
                value={reportScreen.templateName}
                disabled={false}
                onChange={(event, value) => {
                  dispatch(
                    DynamicReportReducerAction.updateTemplateName(value)
                  );
                  if (value !== "" && reportScreen.mode !== "") {
                    getTemplateKey(value, reportScreen.mode);
                  } else {
                    dispatch(DynamicReportReducerAction.updateTemplateKey(""));
                  }

                  if (value === "") {
                    editorRef.current.setContent("");
                    dispatch(DynamicReportReducerAction.resetReportScreen());
                  }
                }}
                options={reportScreen.reportList}
                renderInput={handleRenderInput}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2} xl={3}>
              <CustomDropDown
                label="Mode"
                required={true}
                dropDownValue={mode}
                variant="standard"
                value={reportScreen.mode}
                onChange={(event) => {
                  editorRef.current.setContent("");
                  dispatch(
                    DynamicReportReducerAction.updateTemplateHeaderKey(0)
                  );
                  dispatch(
                    DynamicReportReducerAction.updateMode(event.target.value)
                  );
                  if (
                    event.target.value !== "" &&
                    reportScreen.templateName !== ""
                  ) {
                    getTemplateKey(
                      reportScreen.templateName,
                      event.target.value
                    );
                  } else {
                    dispatch(DynamicReportReducerAction.updateTemplateKey(""));
                  }
                }}
                disabled={reportScreen.templateName === ""}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2} xl={3}>
              {reportScreen.mode !== "MODIFY" && (
                <CustomTextField
                  variant="standard"
                  type="text"
                  placeholder="Template Key"
                  label="Template Key"
                  required={false}
                  disabled={true}
                  value={reportScreen.templateKey}
                />
              )}

              {reportScreen.mode === "MODIFY" && (
                <CustomDropDown
                  label="Template Key List"
                  required={true}
                  dropDownValue={reportScreen.templateKeyList}
                  variant="standard"
                  value={reportScreen.templateKey}
                  onChange={(event) => {
                    dispatch(
                      DynamicReportReducerAction.updateTemplateKey(
                        event.target.value
                      )
                    );
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2} xl={3}>
              <InputLabel
                required={false}
                size="small"
                sx={{
                  color: "#004A92",
                  mb: 2,
                  fontWeight: 400,
                  fontSize: "14px",
                }}
              >
                {"Active"}
              </InputLabel>
              <FormControl>
                {" "}
                <Checkbox
                  checked={reportScreen.active}
                  onChange={() => {
                    dispatch(
                      DynamicReportReducerAction.updateActive(
                        !reportScreen.active
                      )
                    );
                  }}
                  disabled={
                    reportScreen.templateName === "" || reportScreen.mode === ""
                  }
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                type="submit"
                sx={{ height: "2rem", marginRight: "2%" }}
                disabled={reportScreen.fetchButtonDisable}
                onClick={() => {
                  getContent();
                }}
              >
                FETCH
              </Button>

              <Button
                variant="contained"
                type="submit"
                sx={{ height: "2rem", marginRight: "2%" }}
                disabled={reportScreen.saveButtonDisable}
                onClick={() => {
                  save();
                }}
              >
                Save
              </Button>

              <VariablesDialog variablesList={reportScreen.variablesList} />
            </Grid>
          </Grid>
        </Box>
      </AccordianContainer>

      <AccordianContainer
        id="accord"
        title="Editor"
        initialOpen={true}
        sx={{ margin: "8px !important" }}
      >
        <Editor
          disabled={reportScreen.saveButtonDisable}
          apiKey="9pa9ukph5reuk9a90z4081x77tarumht24mejqod8iix10bm"
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue=""
          init={{
            height: 400,
            menubar: true,
            font_family_formats:
              "Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Calibri=Calibri;  Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats",
            plugins:
              "nonbreaking preview searchreplace autolink directionality visualblocks visualchars image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap  linkchecker emoticons autosave",
            toolbar:
              "nonbreaking undo redo spellcheckdialog formatpainter | blocks fontfamily fontsize | bold italic underline forecolor backcolor | link image addcomment showcomments  | alignleft aligncenter alignright alignjustify lineheight | bullist numlist indent outdent | removeformat",
            toolbar_sticky: true,
            nonbreaking_force_tab: true,
            removed_menuitems: "newdocument print",
          }}
        />
      </AccordianContainer>

      <Snackbar
        open={snackBarHandler.alert}
        autoHideDuration={6000}
        anchorOrigin={{ vertical, horizontal }}
        onClose={closeAlertHandler}
      >
        <Alert
          onClose={closeAlertHandler}
          severity={snackBarHandler.alertType}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBarHandler.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TextEditor;

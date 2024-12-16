import React, { useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";

const TextEditor = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  useEffect(() => {
    const lcContent = localStorage.getItem("editorContent");
    console.log(lcContent);
    if (lcContent) {
      const content = convertFromRaw(JSON.parse(lcContent));
      setEditorState(EditorState.createWithContent(content));
    }
  }, []);

  const handleOnChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleBeforeInput = (chars, editorState) => {
    if (chars !== " ") return "not-handled";

    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    const blockText = currentBlock.getText();

    if (
      blockText === "#" ||
      blockText === "*" ||
      blockText === "**" ||
      blockText === "***"
    ) {
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: blockText.length,
        }),
        ""
      );

      let newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );

      if (blockText === "#") {
        newEditorState = RichUtils.toggleBlockType(
          newEditorState,
          "header-one"
        );
      } else if (blockText === "*") {
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
      } else if (blockText === "**") {
        newEditorState = RichUtils.toggleInlineStyle(
          newEditorState,
          "RED_LINE"
        );
      } else if (blockText === "***") {
        newEditorState = RichUtils.toggleInlineStyle(
          newEditorState,
          "UNDERLINE"
        );
      }

      setEditorState(newEditorState);
      return "handled";
    }

    return "not-handled";
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const saveContent = () => {
    const content = editorState.getCurrentContent();
    if (content) {
      localStorage.setItem(
        "editorContent",
        JSON.stringify(convertToRaw(content))
      );
      alert("Content Saved..!");
    } else {
      alert("There is not content to save..!");
    }
  };

  const blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === "header") {
      return "header-style";
    }
    return "";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          height: "50px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "90%",
            textAlign: "center",
          }}
        >
          <h3>Demo Text Editor by Amol Godse</h3>
        </div>
        <button
          onClick={saveContent}
          style={{
            height: "fit-content",
            padding: "5px 20px",
            borderRadius: "15px",
          }}
        >
          Save
        </button>{" "}
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "300px",
          borderRadius: "15px",
        }}
      >
        <Editor
          placeholder="Type here..."
          editorState={editorState}
          onChange={handleOnChange}
          handleBeforeInput={handleBeforeInput}
          handleKeyCommand={handleKeyCommand}
          customStyleMap={{
            RED_LINE: {
              color: "red",
            },
          }}
          blockStyleFn={blockStyleFn}
        />
      </div>
    </div>
  );
};

export default TextEditor;

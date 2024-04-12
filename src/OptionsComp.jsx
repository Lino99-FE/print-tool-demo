import React, {useState,useEffect} from "react";
import useUpdateEffect from "./hooks/useUpdateEffect";

const OptionsComp = ({ mockData, changeData, baseUrl }) => {
  const [optionsData, setOptionsData] = useState({});

  useEffect(() => {
    fetch(`${baseUrl}/mockOpts.json`).then(res => res.json()).then(data => {
      setOptionsData(data);
    });
  }, []);

  const changeOption = (e, key, itemKey) => {
    const { checked } = e.target;
    optionsData[key].options[itemKey].value = checked;
    setOptionsData({ ...optionsData });
  };

  const changeTextArr = (e, key, itemKey, idx) => {
    const { value } = e.target;
    optionsData[key].options[itemKey].value[idx] = value;
    setOptionsData({ ...optionsData });
  }

  const addTextArr = (key, itemKey) => {
    optionsData[key].options[itemKey].value.push("")
    setOptionsData({ ...optionsData });
  }

  const makeNewPrintData = () => {
    const tmpMockData = JSON.parse(JSON.stringify(mockData));
    if (!tmpMockData.options) {
      tmpMockData.options = {}
    }
    Object.keys(optionsData).map(key=> {
      if (optionsData[key].options) {
        Object.keys(optionsData[key].options).map(itemKey => {
          tmpMockData.options[itemKey] = {...optionsData[key].options[itemKey]}
        })
      }
    })
    // console.log('%c [ tmpMockData ]-30', 'font-size:13px; background:pink; color:#bf2c9f;', tmpMockData)
    return tmpMockData
  }

  useUpdateEffect(() => {
    changeData(makeNewPrintData())
  }, [optionsData]);


  return (
    <div style={{marginTop: 20}}>
      {Object.keys(optionsData).map((key) => {
        const obj = optionsData[key];
        if (!obj.label) return;
        const { options = {} } = obj;
        const contentKeys = Object.keys(options);
        return (
          <div key={key} style={{marginBottom: 18,paddingBottom: 8, borderBottom: '2px #cecece solid'}}>
            <div style={{marginBottom: 10}}>{obj.label}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {contentKeys.map((itemKey) => {
                const itemObj = options[itemKey]
                const {type= 'checkbox',label, value} = itemObj 
                return <div key={itemKey}>
                {type==='checkbox'&&<>
                <input id={itemKey} type={type} defaultChecked={value} defaultValue={value} onChange={(e) => changeOption(e, key, itemKey)} /><label htmlFor={itemKey} >{label}</label>
                </>}
                {type==='textArray'&&<>
                  {value.map((text,idx) => <input key={`${itemKey}-${idx}`} type={type} defaultValue={text} onChange={(e) => changeTextArr(e, key, itemKey, idx)} />)}
                  <button onClick={() => addTextArr(key, itemKey)}>加一行</button>
                </>}
              </div>
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OptionsComp;

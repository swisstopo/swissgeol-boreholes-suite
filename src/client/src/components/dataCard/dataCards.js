import React, { useState, useEffect, useMemo, createRef, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Typography } from "@mui/material";
import {
  DataCard,
  DataCardItem,
  DataCardContainer,
  DataCardButtonContainer,
} from "./dataCard";
import { AddButton } from "../buttons/buttons";
import { FullPage, FullPageCentered } from "../baseComponents";

export const DataCards = props => {
  const {
    isEditable,
    parentId,
    getData,
    addData,
    updateData,
    deleteData,
    addLabel,
    emptyLabel,
    renderInput,
    renderDisplay,
  } = props;
  const { t } = useTranslation();
  const mounted = useRef(false);
  const [selected, setSelected] = useState(null);
  const [displayed, setDisplayed] = useState([]);
  const [state, setState] = useState({
    index: 0,
    data: [],
    isLoadingData: true,
  });

  const loadData = index => {
    setState({ ...state, isLoadingData: true });
    if (parentId && mounted.current) {
      getData(parentId).then(response => {
        if (response?.length > 0) {
          setState({
            index: index,
            data: response,
            isLoadingData: false,
          });
        } else {
          setState({
            index: 0,
            data: [],
            isLoadingData: false,
          });
        }
      });
    } else if (parentId === null) {
      setState({
        index: 0,
        data: [],
        isLoadingData: false,
      });
    }
  };

  const handleDataChange = () => {
    loadData(state.index);
  };

  useEffect(() => {
    if (selected === null) {
      setDisplayed(state.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    mounted.current = true;
    loadData(0);
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  useEffect(() => {
    setDisplayed(state.data);
  }, [state.data]);

  // scroll to newly added item
  const dataRefs = useMemo(
    () =>
      Array(displayed?.length)
        .fill(null)
        .map(() => createRef(null)),
    [displayed],
  );

  useEffect(() => {
    if (displayed?.length > 0) {
      const lastDataRef = dataRefs[displayed?.length - 1];
      if (displayed[displayed?.length - 1].id === 0)
        lastDataRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [displayed, dataRefs]);

  return (
    <FullPage>
      <DataCardButtonContainer>
        {isEditable && (
          <AddButton
            sx={{ marginRight: "8px" }}
            data-cy={addLabel + "-button"}
            onClick={e => {
              e.stopPropagation();
              if (!selected) {
                const temp = { id: 0 };
                setDisplayed([...state.data, temp]);
                setSelected(temp);
              }
            }}>
            {t(addLabel)}
          </AddButton>
        )}
      </DataCardButtonContainer>
      {state.isLoadingData ? (
        <FullPageCentered>
          <CircularProgress color="inherit" />
        </FullPageCentered>
      ) : displayed?.length > 0 ? (
        <DataCardContainer>
          {displayed
            .sort((a, b) => a.fromDepthM - b.fromDepthM)
            .map((item, index) => {
              const isSelected = selected?.id === item.id;
              const isTemp = item.id === 0;
              return (
                <DataCardItem key={item.id} ref={dataRefs[index]}>
                  <DataCard key={item.id}>
                    {isEditable && isSelected
                      ? renderInput({
                          item: item,
                          setSelected: setSelected,
                          parentId: parentId,
                          updateData: (item, data) => {
                            updateData(item, data).then(() => {
                              handleDataChange();
                            });
                          },
                          addData: data => {
                            addData(data).then(() => {
                              handleDataChange();
                            });
                          },
                        })
                      : !isTemp &&
                        renderDisplay({
                          item: item,
                          selected: selected,
                          setSelected: setSelected,
                          isEditable: isEditable,
                          deleteData: id => {
                            deleteData(id).then(() => {
                              handleDataChange();
                            });
                          },
                        })}
                  </DataCard>
                </DataCardItem>
              );
            })}
        </DataCardContainer>
      ) : (
        <FullPageCentered>
          <Typography variant="fullPageMessage">{t(emptyLabel)}</Typography>
        </FullPageCentered>
      )}
    </FullPage>
  );
};

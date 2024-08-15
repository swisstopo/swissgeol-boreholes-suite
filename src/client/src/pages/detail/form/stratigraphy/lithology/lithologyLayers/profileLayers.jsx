import { useCallback, useContext, useEffect, useRef, useState } from "react";
import * as Styled from "./styles.js";
import ProfileLayersValidation from "./lithologyLayersValidation";
import { createLayerApi, getData } from "./api";
import {
  Box,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  addFaciesDescription,
  addLithologicalDescription,
  deleteFaciesDescription,
  deleteLithologicalDescription,
  faciesDescriptionQueryKey,
  lithologicalDescriptionQueryKey,
  updateFaciesDescription,
  updateLithologicalDescription,
  useFaciesDescription,
  useLayers,
  useLithoDescription,
} from "../../../../../../api/fetchApiV2.js";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import { withTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "react-query";
import { AlertContext } from "../../../../../../components/alert/alertContext.tsx";
import DescriptionLayers from "./descriptionLayers/descriptionLayers.jsx";

const ProfileLayers = props => {
  const { isEditable, selectedStratigraphyID, selectedLayer, setSelectedLayer, reloadLayer, onUpdated } = props.data;
  const { t } = props;
  const [layersWithValidation, setLayersWithValidation] = useState(null);
  const [selecteDescription, setSelectedDescription] = useState(null);
  const [showDelete, setShowDelete] = useState();
  const { showAlert } = useContext(AlertContext);
  const [deleteParams, setDeleteParams] = useState(null);
  const layers = useLayers(selectedStratigraphyID);

  const mounted = useRef(false);

  // React-query mutations and queries.
  const queryClient = useQueryClient();
  const lithoDescQuery = useLithoDescription(selectedStratigraphyID);
  const faciesDescQuery = useFaciesDescription(selectedStratigraphyID);

  const addLithologicalDescriptionMutation = useMutation(
    async params => {
      return await addLithologicalDescription(params);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [lithologicalDescriptionQueryKey],
        });
      },
    },
  );

  const deleteLithologicalDescriptionMutation = useMutation(
    async id => {
      return await deleteLithologicalDescription(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [lithologicalDescriptionQueryKey],
        });
      },
    },
  );

  const updateLithologicalDescriptionMutation = useMutation(
    async params => {
      return await updateLithologicalDescription(params);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [lithologicalDescriptionQueryKey],
        });
      },
    },
  );

  const addFaciesDescriptionMutation = useMutation(
    async params => {
      return await addFaciesDescription(params);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [faciesDescriptionQueryKey],
        });
      },
    },
  );

  const deleteFaciesDescriptionMutation = useMutation(
    async id => {
      return await deleteFaciesDescription(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [faciesDescriptionQueryKey],
        });
      },
    },
  );

  const updateFaciesDescriptionMutation = useMutation(
    async params => {
      return await updateFaciesDescription(params);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [faciesDescriptionQueryKey],
        });
      },
    },
  );

  const setData = useCallback(stratigraphyID => {
    // Todo: use get layers from new api.
    getData(stratigraphyID).then(res => {
      if (mounted.current) {
        setLayersWithValidation(res);
      }
    });
  }, []);

  useEffect(() => {
    mounted.current = true;

    if (selectedStratigraphyID && mounted.current) {
      setData(selectedStratigraphyID);
    } else {
      setLayersWithValidation(null);
    }
    return () => {
      mounted.current = false;
    };
  }, [selectedStratigraphyID, reloadLayer, setData]);

  const createNewLayer = () => {
    createLayerApi(selectedStratigraphyID).then(res => {
      if (res) {
        onUpdated("newLayer");
      }
    });
  };

  const setSelectedLayerFunc = item => {
    if (item === selectedLayer) {
      // unselect if layer is clicked again
      setSelectedLayer(null);
    } else {
      setSelectedLayer(item);
      setSelectedDescription(null);
    }
  };

  const addDescription = (query, mutation) => {
    if (query?.data && query?.data?.length && query?.data[query?.data?.length - 1]?.toDepth == null) {
      showAlert(t("first_add_layer_to_depth"), "error");
    } else {
      setSelectedDescription(null);
      const newFromDepth = query?.data?.at(-1)?.toDepth ?? 0;
      layersWithValidation?.data?.length
        ? mutation.mutate({
            stratigraphyId: selectedStratigraphyID,
            fromDepth: newFromDepth,
            toDepth: layersWithValidation?.data.find(l => l.depth_from === newFromDepth)?.depth_to,
          })
        : showAlert(t("first_add_lithology"), "error");
    }
  };

  const cellStyle = {
    verticalAlign: "top",
    padding: "0",
    width: "33%",
    minHeight: "10em",
  };

  const isLayerSelected = selectedLayer !== null;
  const hasLayers = layersWithValidation?.data?.length > 0;

  if (!layersWithValidation?.data || !lithoDescQuery.isSuccess) {
    return (
      <Box display="flex" justifyContent="center" pt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Styled.Container>
      <TableContainer
        sx={{
          minHeight: "10em",
          overflow: isLayerSelected ? "hidden" : "",
          borderBottom: hasLayers ? "1px solid lightgrey" : "",
        }}>
        <Table stickyHeader aria-label="sticky table" sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Stack direction="row">
                  <Typography>{t("lithology")}</Typography>
                  {isEditable && selectedStratigraphyID !== null && (
                    <Tooltip title={t("add")}>
                      <AddCircleIcon sx={{ marginLeft: 1.5 }} data-cy="add-layer-icon" onClick={createNewLayer} />
                    </Tooltip>
                  )}
                </Stack>
              </TableCell>
              {!isLayerSelected && (
                <TableCell>
                  <Stack direction="row">
                    <Typography>{t("lithological_description")}</Typography>
                    {isEditable && selectedStratigraphyID !== null && (
                      <Tooltip title={t("add")}>
                        <AddCircleIcon
                          sx={{ marginLeft: 1.5 }}
                          data-cy="add-litho-desc-icon"
                          onClick={() => addDescription(lithoDescQuery, addLithologicalDescriptionMutation)}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              )}
              {!isLayerSelected && (
                <TableCell>
                  <Stack direction="row">
                    <Typography>{t("facies_description")}</Typography>
                    {isEditable && selectedStratigraphyID !== null && (
                      <Tooltip title={t("add")} sx={{}}>
                        <AddCircleIcon
                          sx={{ marginLeft: 1.5 }}
                          data-cy="add-facies-desc-icon"
                          onClick={() => addDescription(faciesDescQuery, addFaciesDescriptionMutation)}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ borderLeft: "1px solid lightgrey" }}>
              <td style={cellStyle}>
                {hasLayers && (
                  <ProfileLayersValidation
                    data={{
                      layersWithValidation,
                      layers,
                      isEditable,
                      onUpdated,
                      selectedLayer,
                      showDelete,
                      setShowDelete,
                      selectedStratigraphyID,
                      setSelectedLayer: setSelectedLayerFunc,
                    }}
                    setDeleteParams={setDeleteParams}
                  />
                )}
              </td>
              <td style={{ ...cellStyle, display: isLayerSelected ? "none" : "" }}>
                <DescriptionLayers
                  isEditable={isEditable}
                  descriptions={lithoDescQuery?.data}
                  setSelectedDescription={setSelectedDescription}
                  selectedDescription={selecteDescription}
                  layers={layersWithValidation}
                  addMutation={addLithologicalDescriptionMutation}
                  deleteMutation={deleteLithologicalDescriptionMutation}
                  updateMutation={updateLithologicalDescriptionMutation}
                  selectedStratigraphyID={selectedStratigraphyID}
                  deleteParams={deleteParams}
                />
              </td>
              <td style={{ ...cellStyle, display: isLayerSelected ? "none" : "" }}>
                <DescriptionLayers
                  isEditable={isEditable}
                  descriptions={faciesDescQuery?.data}
                  setSelectedDescription={setSelectedDescription}
                  selectedDescription={selecteDescription}
                  layers={layersWithValidation}
                  addMutation={addFaciesDescriptionMutation}
                  deleteMutation={deleteFaciesDescriptionMutation}
                  updateMutation={updateFaciesDescriptionMutation}
                  selectedStratigraphyID={selectedStratigraphyID}
                  deleteParams={deleteParams}
                />
              </td>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {!hasLayers && <Styled.Empty>{t("nothingToShow")}</Styled.Empty>}
    </Styled.Container>
  );
};

const TranslatedProfileLayers = withTranslation()(ProfileLayers);
export default TranslatedProfileLayers;

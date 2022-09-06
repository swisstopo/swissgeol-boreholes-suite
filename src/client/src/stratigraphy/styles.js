import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex: 1 1 100%;
  flex-direction: row;
`;

export const FirstColumn = styled.div`
  position: relative;
  width: 60px;
`;

export const FirstLayerList = styled.div`
  position: relative;
  margin: 0px 12px;
  background-color: ${props => props.backgroundColor};
  background-image: ${props => props.backgroundImage};
  height: ${props => props.height};
`;
export const LensContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.3);
  box-shadow: rgba(0, 0, 0, 0.2) 4px 4px 12px;
  border: thin solid rgba(165, 165, 165, 0.5);
  cursor: ${props => props.cursor};
  display: flex;
  flex-direction: column;
  height: ${props => props.height};
  margin: 0px 4px;
  position: absolute;
  top: 0px;
  width: 52px;
`;

export const LensNumber = styled.div`
  color: black;
  font-size: 10px;
  text-align: center;
`;

export const ColumnsContainer = styled.div`
  flex: 1 1 100%;
  position: relative;
`;

export const ShakingColumns = styled.div`
  position: absolute;
  top: ${props => props.offset};
  width: 100%;
`;

export const LayerInfoList = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: ${props => props.height};
  transition: background-color 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
`;

export const SecondLayerList = styled.div`
  min-width: 4em;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-color: ${props => props.backgroundColor};
  background-image: ${props => props.backgroundImage};
`;

export const LayerLength = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: ${props => (props.isBig ? "0.7em" : "0.6em")};
  font-weight: bold;
  text-align: center;
  transition: font-size 0.25s;
`;

export const LayerTitleContainer = styled.div`
  flex: 1 1 100%;
  padding: 0.5em 1em 0.5em 0.5em;
  overflow: hidden;
`;

export const ShakingLayerTitle = styled.div`
  position: sticky;
  top: 0.5em;
`;

export const LayerTitle = styled.div`
  font-weight: bold;
  font-size: ${props => (props.isBig ? "1em" : "0.8em")};
  transition: font-size 0.25s;
`;

export const LayerSubtitle = styled.div`
  color: #787878;
  font-size: 0.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

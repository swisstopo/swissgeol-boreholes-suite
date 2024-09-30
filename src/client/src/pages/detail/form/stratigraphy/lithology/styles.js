import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px;
  padding-left: 0;
  padding-right: 0px;
  flex: 1 1 100%;
  overflow: hidden;
`;

export const Empty = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 23px;
  flex: 1 1 100%;
`;

export const FirstColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  overflow: hidden;
`;

export const SecondColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  overflow: hidden;
`;

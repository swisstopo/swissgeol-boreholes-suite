import styled from "styled-components";

export const MyCard = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  cursor: pointer;
  :hover {
    background-color: #ebebeb;
  }
`;

export const CardPattern = styled.div`
  background-color: ${props => `rgb(${props.r},${props.g},${props.b})`};
  background-size: auto;
  flex: 1;
  width: 40px;
  background-repeat: repeat;
  max-height: 10em;
`;

export const CardInfo = styled.div`
  padding: 5px 0px;
  padding-left: 12px;
  flex: 5;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 10em;
  max-height: 10em;
`;

import { Button } from "semantic-ui-react";
import styled from "styled-components";

export const ErrorCard = styled.div`
  display: flex;
  flex: 1;
  padding: 7px 0px;
  flex-direction: column;
  background-color: #fff6f6;
  border-right: 1px solid lightgrey;
  border-bottom: 1px solid lightgrey;

  min-height: 10em;
  flex: ${props => props.isDelete && "6"};
  /* :hover {
    background-color: red;
  } */
`;

export const HowToResolveContainer = styled.div`
  font-size: 0.8em;
  color: #9f3a38;
  margin-bottom: 3px;
`;
export const Row = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
export const ErrorMessageContainer = styled.div`
  color: #9f3a38;
  font-weight: bold;
  flex: 5.7;
  padding-left: 8px;
`;
export const SolutionContainer = styled.div`
  padding-left: 8px;
`;
export const CardButtonContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 10px;
`;
export const WrenchButtonContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CardButton = styled(Button)`
  /* color: red; */
  /* flex: 1; */
`;

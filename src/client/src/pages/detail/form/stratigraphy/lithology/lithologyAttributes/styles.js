import { Form } from "semantic-ui-react";
import styled from "styled-components";

export const Container = styled.div`
  overflow-y: auto;
  flex: 1 1 100%;
  padding: 10px 10px 0px 15px;
  opacity: ${props => props.disable && "0.5"};
  pointer-events: ${props => props.disable && "none"};
  background-color: ${props => !props.disable && "lightgray"};
`;

export const CheckboxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 15px;
`;

export const AttributesContainer = styled(Form.Field)``;

export const Label = styled.label`
  font-weight: bold;
`;

export const AttributesItem = styled.div`
  width: 100%;
  margin-top: 5px;
  padding-bottom: 10px;
`;

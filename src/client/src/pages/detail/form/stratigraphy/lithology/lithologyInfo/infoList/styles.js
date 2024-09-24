import { Form } from "semantic-ui-react";
import styled from "styled-components";

export const FormContainer = styled.div`
  display: grid;
  grid-template-columns: 48% 48%;
  column-gap: 2%;
`;
export const CheckBoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  align-items: center;
`;
export const AttributesContainer = styled(Form.Field)``;

export const AttributesItem = styled.div`
  margin-top: 5px;
  padding-bottom: 10px;
`;

export const Label = styled.label`
  font-weight: bold;
`;

import { Form } from "semantic-ui-react";
import styled from "styled-components";

export const ContainerList = styled.div``;

export const Container = styled.div`
  flex: 1 1 100%;
`;

export const CheckboxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 15px;
`;

export const AttributesContainer = styled(Form.Field)``;

export const Label = styled.label`
  font-weight: 700 !important;
  font-size: 12px !important;
  margin-top: 10px !important;
`;

export const AttributesItem = styled.div`
  width: 100%;
  margin-top: 5px;
  margin-bottom: 10px;
`;

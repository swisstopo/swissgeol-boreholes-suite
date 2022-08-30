import styled from 'styled-components';
import { Form } from 'semantic-ui-react';

export const FormContainer = styled.div`
  display: grid;
  grid-template-columns: 9% 9% 9% 13% 13% 13% 10% 10% 7%;
  column-gap: 1.25%;
  min-width: 500px;
`;

export const AttributesContainer = styled(Form.Field)``;

export const AttributesItem = styled.div`
  margin-top: 5px;
  padding-bottom: 10px;
`;

export const Label = styled.label`
  font-weight: bold;
  white-space: nowrap;
`;

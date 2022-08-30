import styled, { keyframes } from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  overflow: auto;
`;
export const SearchFilterLabel = styled.div`
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 0.75em;
`;
export const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;
const ButtonSelected = keyframes`
  0%   {background-color:lightslategray; }
  50%  {background-color:lightgrey; }
  100% {background-color:#e0e0e0; }
`;

export const FilterButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 7px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  border-bottom-width: ${props => (props.isLast ? '1px' : '0px')};
  background-color: ${props => props.isSelected && '#e0e0e0'};
  animation-name: ${props => props.isSelected && ButtonSelected};
  animation-duration: 3s;
  animation-iteration-count: 1;
`;

export const FormFilterContainer = styled.div`
  padding: 7px;
  padding-right: 15px;
  border: 1px solid #e0e0e0;
`;

import styled from 'styled-components';

export const Container = styled.div`
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: ${props => props.disable && '0.5'};
  pointer-events: ${props => props.disable && 'none'};
`;

export const ButtonContainer = styled.div`
  flex: 1 1 5%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
`;

export const Empty = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 23px;
  flex: 1 1 70%;
`;

export const ListContainer = styled.div`
  flex: 1 1 70%;
  overflow-y: auto;
  overflow-x: hidden;
`;

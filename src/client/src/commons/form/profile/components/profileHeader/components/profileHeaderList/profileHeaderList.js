import React from 'react';
import * as Styled from './styles';
import DateText from '../../../../../dateText';
import { Icon } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';

const ProfileHeaderList = props => {
  const { profiles, selectedStratigraphy, setSelectedStratigraphy } = props;
  const { t } = useTranslation();

  return (
    <Styled.Container>
      {profiles?.map(item => (
        <Styled.Item
          key={item.id}
          onClick={() => {
            setSelectedStratigraphy(item);
          }}
          style={{
            borderBottom:
              item.id === selectedStratigraphy?.id && '2px solid black',
          }}>
          <Styled.ItemName>
            {item.primary && <Icon name="check" />}
            {item.name === null || item.name === ''
              ? t('common:np')
              : item.name}
          </Styled.ItemName>
          <Styled.ItemDate>
            <DateText date={item.date} />
          </Styled.ItemDate>
        </Styled.Item>
      ))}
    </Styled.Container>
  );
};

export default ProfileHeaderList;

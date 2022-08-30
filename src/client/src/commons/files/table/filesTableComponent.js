import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  Icon,
  Table,
  TextArea,
} from 'semantic-ui-react';
import DateText from '../../form/dateText';
import DownloadLink from '../downloadlink';
import TranslationText from '../../form/translationText';

const FilesTableComponent = props => {
  return (
    <div
      className='flex_col flex_fill'
      style={{
        overflowY: "auto"
      }}
    >
      <Table singleLine>
        <Table.Header>
          <Table.Row>
            {
              props.editor === true &&
              <Table.HeaderCell>
                <TranslationText
                  id='public'
                />
              </Table.HeaderCell>
            }
            <Table.HeaderCell>
              <TranslationText
                id='name'
              />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <TranslationText
                id='description'
              />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <TranslationText
                id='type'
              />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <TranslationText
                id='uploaded'
              />
            </Table.HeaderCell>
            {props.unlocked === true? <Table.HeaderCell />: null}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            props.files.map(
              file => (
                <Table.Row
                  key={'ftc-' + file.id}
                >
                  {
                    props.editor === true &&
                    <Table.Cell>
                      {
                        props.unlocked === true?
                          <Checkbox
                            checked={file.public}
                            onChange={(e, d) => {
                              props.patchFile(
                                props.id, file.id,
                                'public',
                                d.checked
                              );
                            }}
                          />:
                          file.public === true?
                            
                            <Icon
                              color='green'
                              name='lock open'
                            />:
                            <Icon
                              color='red'
                              name='lock'
                            />
                      }
                    </Table.Cell>
                  }
                  <Table.Cell>
                    <DownloadLink
                      caption={file.name}
                      id={file.id}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {
                      props.unlocked === true?
                        <TextArea
                          onChange={(e, data) => {
                            props.patchFile(
                              props.id, file.id,
                              'description',
                              e.target.value
                            );
                          }}
                          rows={1}
                          value={file.description}
                        />:
                        file.description
                    }
                  </Table.Cell>
                  <Table.Cell>
                    {file.type}
                  </Table.Cell>
                  <Table.Cell>
                    <DateText
                      date={file.uploaded}
                      hours
                    />
                    <br />
                    <span
                      style={{
                        color: '#787878'
                      }}
                    >
                      {file.username}
                    </span>
                  </Table.Cell>
                  {
                    props.unlocked === true?
                      <Table.Cell>
                        <Button
                          basic
                          color='red'
                          icon
                          onClick={(e)=>{
                            e.stopPropagation();
                            props.detachFile(
                              props.id, file.id
                            );
                          }}
                          size='mini'
                        >
                          <Icon name='trash alternate outline' />
                        </Button>
                      </Table.Cell>: null
                  }
                </Table.Row>
              )
            )
          }
        </Table.Body>
      </Table>
    </div>
  );
};

FilesTableComponent.propTypes = {
  detachFile: PropTypes.func,
  editor: PropTypes.bool,
  files: PropTypes.array,
  id: PropTypes.number,
  patchFile: PropTypes.func,
  reload: PropTypes.func,
  t: PropTypes.func,
  unlocked: PropTypes.bool,
};

FilesTableComponent.defaultProps = {
  editor: false,
  files: [],
  id: null,
  unlocked: false
};

export default withTranslation('common')(FilesTableComponent);

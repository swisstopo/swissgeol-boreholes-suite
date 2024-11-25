import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Form, Input, TextArea } from "semantic-ui-react";
import _ from "lodash";
import DateField from "../../../../components/legacyComponents/dateField.jsx";
import DomainDropdown from "../../../../components/legacyComponents/domain/dropdown/domainDropdown";
import DomainTree from "../../../../components/legacyComponents/domain/tree/domainTree";
import TranslationText from "../../../../components/legacyComponents/translationText.jsx";
import HierarchicalDataSearch from "../../../detail/form/stratigraphy/hierarchicalDataSearch";
import CantonDropdown from "./cantonDropdown.jsx";
import { filterAccordionValues } from "./filterData/filterAccordionValues";
import * as Styled from "./listFilterStyles";

const ListFilter = ({ attributeId, showAllForAccordion, setShowAllForAccordion }) => {
  const dispatch = useDispatch();
  const setFilter = (key, value) => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_CHANGED",
      key: key,
      value: value,
    });
  };

  const { t } = useTranslation();
  const settings = useSelector(state => state.setting);
  const search = useSelector(state => state.filters);

  const attribute = filterAccordionValues.find(f => f.id === attributeId);

  const isVisibleFunction = filter => {
    return _.get(settings.data.efilter, filter) === true;
  };

  const showAll = showAllForAccordion.find(f => f.id === attributeId)?.showAll;

  const setShowAll = showAll => {
    setShowAllForAccordion(showAllForAccordion.map(f => (f.id === attributeId ? { id: attributeId, showAll } : f)));
  };

  useEffect(() => {
    console.log("mounted");
    return () => {
      console.log("unmount");
    };
  }, []);
  const showCheckbox = attribute?.hideShowAllFields !== true;

  return (
    <Styled.Container key={attributeId}>
      {showCheckbox && (
        <Styled.CheckboxContainer>
          {t("showallfields")}
          <Checkbox checked={showAll} onChange={() => setShowAll(!showAll)} toggle />
        </Styled.CheckboxContainer>
      )}

      {attribute?.searchData && (
        <Styled.ContainerList>
          {attribute.searchData.map(item => (
            <Form autoComplete="false" error key={item.id}>
              <Styled.AttributesContainer>
                {(item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) &&
                  item.type !== "HierarchicalData" && (
                    <Styled.Label>
                      <TranslationText id={item.label} />
                    </Styled.Label>
                  )}
                {item.type === "Input" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
                  <Styled.AttributesItem>
                    <Input
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      onChange={e =>
                        setFilter(item.value, e.target.value === "" ? "" : e.target.value, item?.to, item?.isNumber)
                      }
                      placeholder={t(item?.placeholder)}
                      spellCheck="false"
                      style={{ width: "100%" }}
                      type={item?.inputType}
                      value={_.isNil(search.filter?.[item.value]) ? "" : search.filter[item.value]}
                    />
                  </Styled.AttributesItem>
                )}

                {item.type === "TextArea" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
                  <Styled.AttributesItem>
                    <TextArea
                      onChange={e => setFilter(item.value, e.target.value)}
                      style={{ width: "100%" }}
                      value={_.isNil(search.filter?.[item.value]) ? "" : search.filter[item.value]}
                    />
                  </Styled.AttributesItem>
                )}

                {item.type === "Radio" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
                  <Form.Group>
                    <div style={{ display: "flex", paddingTop: "5px" }}>
                      {item.hasUnknown && (
                        <>
                          <Form.Radio
                            checked={search.filter?.[item.value] === true}
                            label={t("yes")}
                            onChange={() => setFilter(item.value, true, item?.to)}
                            style={{
                              paddingRight: "10px",
                              paddingLeft: "10px",
                            }}
                          />
                          <Form.Radio
                            checked={search.filter?.[item.value] === false}
                            label={t("no")}
                            onChange={() => setFilter(item.value, false, item?.to)}
                            style={{ paddingRight: "10px" }}
                          />
                          <Form.Radio
                            checked={search.filter?.[item.value] === null}
                            label={t("np")}
                            onChange={() => setFilter(item.value, null, item?.to)}
                          />
                        </>
                      )}
                    </div>
                  </Form.Group>
                )}

                {item.type === "ReferenceSystem" &&
                  (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
                    <Form.Group data-cy="spatial-reference-filter">
                      <div
                        style={{
                          display: "flex",
                          paddingTop: "5px",
                          paddingLeft: "5px",
                        }}>
                        {item.hasUnknown && (
                          <>
                            <Form.Radio
                              data-cy="radiobutton-all"
                              checked={search.filter?.[item.value] === null}
                              label={t("all")}
                              onChange={() => setFilter(item.value, null, item?.to)}
                            />
                            <Form.Radio
                              data-cy="radiobutton-LV95"
                              checked={search.filter?.[item.value] === 20104001}
                              label="LV95"
                              onChange={() => setFilter(item.value, 20104001, item?.to)}
                              style={{
                                paddingRight: "10px",
                                paddingLeft: "10px",
                              }}
                            />
                            <Form.Radio
                              data-cy="radiobutton-LV03"
                              checked={search.filter?.[item.value] === 20104002}
                              label="LV03"
                              onChange={() => setFilter(item.value, 20104002, item?.to)}
                              style={{ paddingRight: "10px" }}
                            />
                          </>
                        )}
                      </div>
                    </Form.Group>
                  )}

                {item.type === "Dropdown" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
                  <Styled.AttributesItem>
                    <DomainDropdown
                      multiple={item.multiple}
                      onSelected={e => setFilter(item.value, item.multiple ? e.map(mlpr => mlpr.id) : e.id, false)}
                      schema={item.schema}
                      search={item.search}
                      additionalValues={item.additionalValues}
                      selected={_.isNil(search.filter?.[item.value]) ? null : search.filter[item.value]}
                    />
                  </Styled.AttributesItem>
                )}

                {item.type === "HierarchicalData" &&
                  (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
                    <HierarchicalDataSearch
                      onSelected={e => {
                        setFilter(item.value, e.id, false);
                      }}
                      schema={item.schema}
                      labels={item.labels}
                      selected={_.isNil(search.filter?.[item.value]) ? null : search.filter[item.value]}
                    />
                  )}

                {item.type === "DomainTree" &&
                  (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
                    <Styled.AttributesItem>
                      <DomainTree
                        levels={item.levels}
                        onSelected={e => setFilter(item.value, e.id, false)}
                        schema={item.schema}
                        selected={_.isNil(search.filter?.[item.value]) ? null : search.filter[item.value]}
                        title={<TranslationText id={item.label} />}
                        isEditable={true}
                      />
                    </Styled.AttributesItem>
                  )}

                {item.type === "Date" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
                  <Styled.AttributesItem>
                    <DateField
                      date={search.filter?.[item.value] ? search.filter[item.value] : null}
                      onChange={selected => {
                        setFilter(item.value, selected, false);
                      }}
                      placeholder={t(item?.placeholder)}
                    />
                  </Styled.AttributesItem>
                )}

                {item.type === "Canton" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
                  <Styled.AttributesItem>
                    <CantonDropdown
                      onSelected={selected => {
                        setFilter(item.value, selected, false);
                      }}
                      selected={search.filter?.[item.value]}
                    />
                  </Styled.AttributesItem>
                )}
              </Styled.AttributesContainer>
            </Form>
          ))}
        </Styled.ContainerList>
      )}
    </Styled.Container>
  );
};

export default ListFilter;

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, Radio } from "semantic-ui-react";
import { capitalizeFirstLetter } from "../../../../utils";
import { Filter } from "./FilterInterface.ts";

interface StatusFilterProps {
  search: { filter: Filter };
  setFilter: (key: string, value: string) => void;
}
export const StatusFilter = ({ search, setFilter }: StatusFilterProps) => {
  useEffect(() => {
    console.log("mounted status filter");
    return () => {
      console.log("unmount status filter");
    };
  }, []);

  const { t } = useTranslation();
  return (
    <Form
      size="tiny"
      style={{
        padding: "0.5em",
      }}>
      <Form.Field>
        <Radio
          checked={search.filter.role === "all"}
          label={""}
          name="radioGroup"
          onChange={() => {
            setFilter("role", "all");
          }}
        />
        <span
          style={{
            color: "black",
            fontSize: "1.1em",
            fontWeight: "bold",
          }}>
          {capitalizeFirstLetter(t("alls"))}
        </span>
      </Form.Field>
      {["statuseditor", "statuscontroller", "statusvalidator", "statuspublisher"].map(role => (
        <Form.Field key={"sec-" + role}>
          <Radio
            checked={search.filter.role === role.replace("status", "").toUpperCase()}
            label={""}
            name="radioGroup"
            onChange={() => {
              setFilter("role", role.replace("status", "").toUpperCase());
            }}
          />
          <span
            style={{
              color: "black",
              fontSize: "1.1em",
            }}>
            {capitalizeFirstLetter(t(role))}
          </span>
        </Form.Field>
      ))}
    </Form>
  );
};

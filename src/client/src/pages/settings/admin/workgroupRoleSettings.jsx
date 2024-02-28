import { Checkbox, Form } from "semantic-ui-react";

export const WorkgroupRoleSettings = props => {
  const { workgroup, user, setRole } = props;
  const uwg = user.workgroupRoles.filter(w => w.workgroupId === workgroup?.id);
  return (
    <Form>
      <Form.Group autoComplete="off" widths="equal">
        <Form.Field>
          <Checkbox
            checked={uwg !== undefined && uwg.some(x => x.role === "View")}
            label="VIEW"
            onChange={e => {
              e.stopPropagation();
              setRole(uwg, workgroup, "VIEW");
            }}
          />
        </Form.Field>
        {workgroup.supplier === false ? (
          <Form.Field>
            <Checkbox
              checked={uwg !== undefined && uwg.some(x => x.role === "Editor")}
              label="EDITOR"
              onChange={e => {
                e.stopPropagation();
                setRole(uwg, workgroup, "EDIT");
              }}
            />
          </Form.Field>
        ) : null}
        {workgroup.supplier === false ? (
          <Form.Field>
            <Checkbox
              checked={uwg !== undefined && uwg.some(x => x.role === "Controller")}
              label="CONTROLLER"
              onChange={e => {
                e.stopPropagation();
                setRole(uwg, workgroup, "CONTROL");
              }}
            />
          </Form.Field>
        ) : null}
      </Form.Group>
      <Form.Group autoComplete="off" widths="equal">
        {workgroup.supplier === false ? (
          <Form.Field>
            <Checkbox
              checked={uwg !== undefined && uwg.some(x => x.role === "Validator")}
              label="VALIDATOR"
              onChange={e => {
                e.stopPropagation();
                setRole(uwg, workgroup, "VALID");
              }}
            />
          </Form.Field>
        ) : null}
        <Form.Field>
          <Checkbox
            checked={uwg !== undefined && uwg.some(x => x.role === "Publisher")}
            label="PUBLISHER"
            onChange={e => {
              e.stopPropagation();
              setRole(uwg, workgroup, "PUBLIC");
            }}
          />
        </Form.Field>
      </Form.Group>
    </Form>
  );
};

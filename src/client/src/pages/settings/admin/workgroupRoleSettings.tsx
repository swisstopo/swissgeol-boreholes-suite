import { Checkbox, Form } from "semantic-ui-react";
import { Role, User, Workgroup, WorkgroupRole } from "../../../api/apiInterfaces.js";
import { FC } from "react";

export interface WorkgroupRoleSettingsProps {
  user: User;
  workgroup: Workgroup;
  setRole: (uwg: WorkgroupRole[], workgroup: Workgroup, role: Role) => void;
}

export const WorkgroupRoleSettings: FC<WorkgroupRoleSettingsProps> = props => {
  const { workgroup, user, setRole } = props;
  const uwg = user.workgroupRoles?.filter(w => w.workgroupId === workgroup?.id);
  return (
    uwg !== undefined && (
      <Form>
        <Form.Group autoComplete="off" widths="equal">
          <Form.Field>
            <Checkbox
              checked={uwg.some(x => x.role === Role.View)}
              label="VIEW"
              onChange={e => {
                e.stopPropagation();
                setRole(uwg, workgroup, Role.View);
              }}
            />
          </Form.Field>
          {workgroup.isSupplier === false ? (
            <Form.Field>
              <Checkbox
                checked={uwg.some(x => x.role === Role.Editor)}
                label="EDITOR"
                onChange={e => {
                  e.stopPropagation();
                  setRole(uwg, workgroup, Role.Editor);
                }}
              />
            </Form.Field>
          ) : null}
          {workgroup.isSupplier === false ? (
            <Form.Field>
              <Checkbox
                checked={uwg.some(x => x.role === Role.Controller)}
                label="CONTROLLER"
                onChange={e => {
                  e.stopPropagation();
                  setRole(uwg, workgroup, Role.Controller);
                }}
              />
            </Form.Field>
          ) : null}
        </Form.Group>
        <Form.Group autoComplete="off" widths="equal">
          {workgroup.isSupplier === false ? (
            <Form.Field>
              <Checkbox
                checked={uwg.some(x => x.role === Role.Validator)}
                label="VALIDATOR"
                onChange={e => {
                  e.stopPropagation();
                  setRole(uwg, workgroup, Role.Validator);
                }}
              />
            </Form.Field>
          ) : null}
          <Form.Field>
            <Checkbox
              checked={uwg.some(x => x.role === Role.Publisher)}
              label="PUBLISHER"
              onChange={e => {
                e.stopPropagation();
                setRole(uwg, workgroup, Role.Publisher);
              }}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    )
  );
};

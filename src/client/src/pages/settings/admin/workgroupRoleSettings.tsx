import { FC } from "react";
import { Checkbox, Form } from "semantic-ui-react";

import { Role, User, Workgroup, WorkgroupRole } from "../../../api/apiInterfaces.js";

export interface WorkgroupRoleSettingsProps {
  user: User;
  workgroup: Workgroup;
  setRole: (uwg: WorkgroupRole[], workgroup: Workgroup, role: Role) => void;
}

export const WorkgroupRoleSettings: FC<WorkgroupRoleSettingsProps> = props => {
  const { workgroup, user, setRole } = props;
  const workgroupRoles = user.workgroupRoles?.filter(w => w.workgroupId === workgroup?.id);
  return (
    workgroupRoles !== undefined && (
      <Form>
        <Form.Group autoComplete="off" widths="equal">
          <Form.Field>
            <Checkbox
              checked={workgroupRoles.some(x => x.role === Role.View)}
              label="VIEW"
              onChange={e => {
                e.stopPropagation();
                setRole(workgroupRoles, workgroup, Role.View);
              }}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              checked={workgroupRoles.some(x => x.role === Role.Editor)}
              label="EDITOR"
              onChange={e => {
                e.stopPropagation();
                setRole(workgroupRoles, workgroup, Role.Editor);
              }}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              checked={workgroupRoles.some(x => x.role === Role.Controller)}
              label="CONTROLLER"
              onChange={e => {
                e.stopPropagation();
                setRole(workgroupRoles, workgroup, Role.Controller);
              }}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group autoComplete="off" widths="equal">
          <Form.Field>
            <Checkbox
              checked={workgroupRoles.some(x => x.role === Role.Validator)}
              label="VALIDATOR"
              onChange={e => {
                e.stopPropagation();
                setRole(workgroupRoles, workgroup, Role.Validator);
              }}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              checked={workgroupRoles.some(x => x.role === Role.Publisher)}
              label="PUBLISHER"
              onChange={e => {
                e.stopPropagation();
                setRole(workgroupRoles, workgroup, Role.Publisher);
              }}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    )
  );
};

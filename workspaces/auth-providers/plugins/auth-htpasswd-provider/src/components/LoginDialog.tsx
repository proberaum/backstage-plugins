import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Flex, TextField } from '@backstage/ui';

export type LoginDialogProps = {
  onLogin: () => void;
  onClose: () => void;
}

export function LoginDialog({ onLogin, onClose }: LoginDialogProps) {
  return (
    <Dialog isOpen>
      <DialogHeader>Login</DialogHeader>
      <DialogBody>
        <Flex direction="column" gap="3">
          <TextField label="Username" placeholder="Enter username" />
          <TextField label="Password" placeholder="Enter password" />
        </Flex>
      </DialogBody>
      <DialogFooter>
        <Button variant="primary" slot="close" onClick={onLogin}>Login</Button>
        <Button variant="secondary" slot="close" onClick={onClose}>Cancel</Button>
      </DialogFooter>
    </Dialog>
  );
}

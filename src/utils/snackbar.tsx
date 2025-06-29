import React, {
  useReducer,
  createContext,
  Dispatch,
  useContext,
  ReactNode,
} from 'react';

export type SnackbarContextFields = {
  type: string;
  open: boolean;
  alertType: string;
  message?: string;
  icon?: string;
  actionText?: string;
  autoClose?: boolean;
  closerFn?: () => void;
};

const initialState: SnackbarContextFields = {
  type: 'close',
  open: false,
  alertType: 'info',
  icon: undefined,
  actionText: undefined,
  autoClose: true,
  closerFn: undefined,
};

export type SnackbarContextType = {
  alert?: SnackbarContextFields;
  dispatch?: Dispatch<any>;
};

function reducer(state: any, action: any): SnackbarContextFields {
  switch (action.type) {
    case 'close':
      return {
        ...initialState,
      };
    case 'open':
      return {
        ...state,
        open: true,
        alertType: action.alertType,
        message: action.message,
        icon: action.icon,
        actionText: action.actionText,
        autoClose: action.autoClose,
        closerFn: action.closerFn,
      };
    default:
      throw new Error(`unknown action from state: ${JSON.stringify(action)}`);
  }
}

export const SnackbarContext = createContext<SnackbarContextType>({});

type SnackbarProviderProps = {
  children?: ReactNode;
};

/**
 * Wrapper to use in App.tsx providing the value to all children
 */
export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const [alert, dispatch] = useReducer(reducer, initialState);

  return (
    <SnackbarContext.Provider value={{ alert, dispatch }}>
      {children}
    </SnackbarContext.Provider>
  );
}

/**
 * Hook to access the context easily
 */
export function useSnackbar() {
  return useContext(SnackbarContext);
}

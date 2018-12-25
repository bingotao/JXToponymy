import React from 'react';

let AuthorizedContext = React.createContext({ pass: false, edit: false });

export default AuthorizedContext;
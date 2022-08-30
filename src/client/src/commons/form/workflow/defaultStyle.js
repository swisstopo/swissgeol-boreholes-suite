export default {
  
  control: {
    backgroundColor: '#fff',
    fontSize: "14px",
    fontWeight: 'normal',
    // border: '1px solid rgba(34, 36, 38, 0.15)',
  },

  highlighter: {
    // overflow: 'hidden',


    left: '.15rem',
    lineHeight: '17px',
    padding: '0px',
    boxSizing: 'content-box',
    width: '110%',
  },

  input: {
    margin: 0,
    outline: "1px",
  },

  suggestions: {

    list: {
      backgroundColor: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.15)',
      fontSize: "14px",
      overflowY: 'auto',
      maxHeight: '300px'
    },

    item: {
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0, 0, 0, 0.15)',

      '&focused': {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderLeft: '0.25em solid rgb(237, 29, 36)',
        fontWeight: 'bold'
      },
    },
  },
};

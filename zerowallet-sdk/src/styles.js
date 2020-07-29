module.exports.styles = `
.zerowallet-container {
  position: fixed;
  width: 0px;
  height: 0px;
  top: 0px;
  right: 0px;
  z-index: 123123123123;
}
@media (max-width: 576px) {
  .zerowallet-container {
    bottom: 0;
    top: auto;
  }
}
.zerowallet-widget-frame {
  position: fixed;
  width: 375px;
  height: 0;
  top: 20px;
  right: 20px;
  box-shadow: 0 5px 40px rgba(0,0,0,0.20);
  border-radius: 8px;
  overflow: hidden;
  z-index: 123123123123;
}
@media (max-width: 576px) {
  .zerowallet-widget-frame {
    bottom: 0;
    top: auto;
    width: 100%;
    right: 0;
    left: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}
`;
const { getProps } = require('../function/propsUtil');

const renderButton = (config) => {
    const { buttonArr = [] } = config;
    return `<span className="btn-group">
        ${buttonArr.map((btn) => {
            const { btnText = 'button', expandFlag = '0' } = btn;
            if (expandFlag === '1') {
                return getExpandBtn(btn);
            } else {
                return `<Button${getProps(btn, 'Button')}>
                    ${btnText}
                </Button>`;
            }
        }
    ).join('\n')}
    </span>`;
};

const getExpandBtn = (btnConfig) => {
    const { btnIndex } = btnConfig;
    return `<a
            className="btn-collapse"
            onClick="{this.onCollapse}"
            href="javascript:void(0);"
            key="btn-${btnIndex}"
        >
            {this.state.expand ? '隐藏' : '展开' }
            <Icon type={this.state.expand ? 'up' : 'down'} />
        </a>
    `;
}

module.exports = renderButton;
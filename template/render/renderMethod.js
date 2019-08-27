const getDispatchStr =(form, fileConfig, pageName) => {
    const getApiName = require('../function/getApiName');
    const { formType, queryApi = '', addApi, editApi } = form;
    if (formType === 'query') {
        const formConfigs = getFormConfigsByType(fileConfig);
        return queryApi ? `${getSubmitValues(formConfigs)}
        dispatch({
            type: '${pageName}/${getApiName(queryApi)}',
            payload: values,
        });` : '// add code here';
    } else {
        const formConfigs = getFormConfigsByType(fileConfig, 'save');
        return `
            ${getSubmitValues(formConfigs)}
            const { mode = 'add' } = this.props;
            const disptachType = mode === 'add' ? '${pageName}/${getApiName(addApi)}' : '${pageName}/${getApiName(editApi)}';
            dispatch({
            type: disptachType,
            payload: values,
        });
        `;
    }
};

const getSubmitValues = (formConfigs) => {
    const { formItemArr = [] } = formConfigs || {};
    const dateKeys = [];
    let dateStr = '';
    formItemArr.forEach((item) => {
        const { type } = item;
        if (type === 'DatePicker' || type === 'RangePicker') {
            dateKeys.push(item);
        }
    });
    if (dateKeys.length > 0) {
        dateStr = dateKeys.reduce((arr, { name, format }) => {
            arr.push(`values.${name} = values.${name} && values.${name}.format('${format}');`);
            return arr;
        }, []).join('\n');
    }
    return dateStr;
};

const getFormConfigsByType = (fileConfig, pType ='query') => {
    const { layoutConfig = [] } = fileConfig;
    const formConfigs = layoutConfig.find(({ type, formType }) => {
        return type === 'FormContainer' && formType === pType;
    });
    return formConfigs;
};

const renderOpItem = (itemConfigs) => {
    const getApiName = require('../function/getApiName');
    const { opText, opType, modalData, modalName, api } = itemConfigs;
    let str = '';
    if (opType === 'edit' || opType === 'view') {
        str =  modalData === 'table' ? 'this.setState({ editData: record });' : `this.setState({ editData: record, init${modalName}Api: '${getApiName(api)}' });`;
        return `<a onClick={() => {
            ${str}
            this.onShowModal('${modalName}');
        }}>${opText}</a>`;
    }
    return `<span>${opText}</span>`;
};

const renderOperation = (operationArr) => {
    return `_columns[columns.length - 1].render = (text, record) => {
        return (
            <Fragment>
            ${
                operationArr.map((itemConfigs) => {
                    return renderOpItem(itemConfigs);
                }).join('\n<Divider type="vertical" />\n')
            }
        </Fragment>
        );
    };`;
};

const renderMethod = (extraConfig, fileConfig, pName) => {
    const {
        form,
        table,
        pageName,
        modalArr,
    } =  extraConfig;
    const methodStrArr= [];
    if (form) {
        methodStrArr.push(`
            onSubmit(e) {
                e && e.preventDefault();
                const { form, dispatch } = this.props;
                form.validateFields((err, values) => {
                    if (!err) {
                       ${getDispatchStr(form, fileConfig, pName || pageName)}
                    }
                });
            }
        `);
    }
    if (modalArr) {
        methodStrArr.push(`
            onHiddenModal = (modalName) => {
                this.setState({
                    [\`show\${modalName\}\`]: false,
                });
            }
        `);
        methodStrArr.push(`
            onShowModal = (modalName) => {
                this.setState({
                    [\`show\${modalName\}\`]: true,
                });
            }
        `);
    }
    if (table) {
        const { hasOperation, operationArr = [] } = table;
        methodStrArr.push(`
        onInitColumns = (columns) => {
            const _columns = columns;
            ${
                hasOperation === '1' && operationArr.length > 0 ? renderOperation(operationArr) : ''
            }
            return _columns;
        }
        `);
    }
    if (table && table.pagination) {
        methodStrArr.push(`
        onPageIndexChange = (page, pageSize) => {
            this.setState({
                PageIndex: page,
                PageSize: pageSize,
            })
        }
        onShowSizeChange = (current, size) => {
            this.setState({
                PageIndex: current,
                PageSize: size,
            });
        }`);
    }
    return methodStrArr.join('\n');
};

module.exports = renderMethod;
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import AsyncSelect from 'react-select/lib/Async';
import colors from 'config/colors';

const styles = isSearchable => ({
    singleValue: base => ({
        ...base,
        color: colors.TEXT_SECONDARY,
    }),
    control: (base, { isDisabled }) => ({
        ...base,
        borderRadius: '2px',
        borderColor: colors.DIVIDER,
        boxShadow: 'none',
        background: isDisabled ? colors.LANDING : colors.WHITE,
        '&:hover': {
            cursor: isSearchable ? 'text' : 'pointer',
            borderColor: colors.DIVIDER,
        },
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: base => ({
        ...base,
        display: isSearchable ? 'none' : 'block',
        color: colors.TEXT_SECONDARY,
        path: '',
        '&:hover': {
            color: colors.TEXT_SECONDARY,
        },
    }),
    menu: base => ({
        ...base,
        margin: 0,
        boxShadow: 'none',
    }),
    menuList: base => ({
        ...base,
        padding: 0,
        boxShadow: 'none',
        background: colors.WHITE,
        borderLeft: `1px solid ${colors.DIVIDER}`,
        borderRight: `1px solid ${colors.DIVIDER}`,
        borderBottom: `1px solid ${colors.DIVIDER}`,
    }),
    option: (base, { isSelected }) => ({
        ...base,
        color: colors.TEXT_SECONDARY,
        background: isSelected ? colors.LANDING : colors.WHITE,
        borderRadius: 0,
        '&:hover': {
            cursor: 'pointer',
            background: colors.LANDING,
        },
    }),
});

const SelectWrapper = props => (
    <div>
        {props.isAsync && <AsyncSelect styles={styles(props.isSearchable)} {...props} /> }
        {!props.isAsync && <Select styles={styles(props.isSearchable)} {...props} />}
    </div>
);

SelectWrapper.propTypes = {
    isAsync: PropTypes.bool,
    isSearchable: PropTypes.bool,
};

SelectWrapper.defaultProps = {
    isAsync: false,
    isSearchable: false,
};

export default SelectWrapper;

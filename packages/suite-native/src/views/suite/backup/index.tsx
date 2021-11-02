import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View, Text, Button } from 'react-native';
import { useTheme } from '@trezor/components';

import * as routerActions from '@suite-actions/routerActions';
import styles from '@native/support/suite/styles';
import { Dispatch } from '@suite-types';

const mapDispatchToProps = (dispatch: Dispatch) => ({
    goto: bindActionCreators(routerActions.goto, dispatch),
    back: bindActionCreators(routerActions.back, dispatch),
});

type Props = ReturnType<typeof mapDispatchToProps>;

const Backup = (props: Props) => {
    const theme = useTheme();

    return (
        <View style={styles(theme).container}>
            <Text style={styles(theme).h1}>Backup</Text>
            <View style={{ margin: 20 }}>
                <Text>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam
                </Text>
            </View>
            <View style={{ margin: 20 }}>
                <Button onPress={props.back} title="Back to previous screen" />
            </View>
            <Button onPress={() => props.goto('wallet-send')} title="Go to wallet send page" />
        </View>
    );
};

export default connect(null, mapDispatchToProps)(Backup);

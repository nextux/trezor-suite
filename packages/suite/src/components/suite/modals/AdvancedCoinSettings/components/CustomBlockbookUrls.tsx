import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import TrezorConnect, { BlockchainLink } from 'trezor-connect';
import { Input, Button, Tooltip, SelectBar, H3 } from '@trezor/components';
import { Translation, TooltipSymbol } from '@suite-components';
import { isUrl } from '@suite-utils/validators';
import { useTranslation } from '@suite-hooks/useTranslation';
import InputError from '@wallet-components/InputError';
import * as walletSettingsActions from '@settings-actions/walletSettingsActions';
import { useActions, useSelector } from '@suite-hooks';
import ConnectionInfo from './ConnectionInfo';
import type { Network } from '@wallet-types';
import type { BackendType } from '@wallet-reducers/settingsReducer';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    text-align: left;
    & > * + * {
        margin-top: 8px;
    }
`;

const ButtonRow = styled.div`
    display: flex;
    & > * + * {
        margin-left: 12px;
    }
`;

const ButtonConnectionInfo = styled(Tooltip)`
    margin-left: auto;
`;

const Heading = styled(H3)`
    color: ${props => props.theme.TYPE_DARK_GREY};
    margin-bottom: 6px;
`;

const TooltipContent = styled.div`
    display: flex;
    flex-direction: column;
`;

const SaveButton = styled(Button)`
    width: 200px;
    margin-top: 30px;
    align-self: center;
`;

type FormInputs = {
    url: string;
};

const useDefaultBackendSettings = (coin: Network['symbol']) => {
    const [link, setLink] = useState<BlockchainLink>();
    useEffect(() => {
        TrezorConnect.getCoinInfo({ coin }).then(result => {
            if (result.success) {
                setLink(result.payload.blockchainLink);
            }
        });
    }, [coin]);
    return {
        type: link?.type as BackendType,
        urls: link?.url ?? [],
    };
};

type BackendValues = {
    type: BackendType | 'default';
    urls: string[];
};

const getSupportedBackends = (network: Network): BackendType[] => {
    if (network.networkType === 'ripple') return [];
    if (network.symbol === 'btc') return ['blockbook', 'electrum'];
    return ['blockbook'];
};

const getUrlPlaceholder = (network: Network, type: BackendType | 'default') => {
    switch (type) {
        case 'blockbook':
            return `https://${network.symbol}1.trezor.io/`;
        case 'electrum':
            return `electrum.foobar.com:50001:t`;
        default:
            return '';
    }
};

const useInitialValues = (coin: Network['symbol']): BackendValues => {
    const { backend } = useSelector(state => ({
        backend: state.wallet.settings.backends[coin],
    }));
    return {
        type: backend?.type ?? 'default',
        urls: backend?.urls ?? [],
    };
};

const useUrlInput = (currentUrls: string[]) => {
    const { register, watch, setValue, errors } = useForm<FormInputs>({
        mode: 'onChange',
    });

    const name = 'url';
    const ref = register({
        validate: (value: string) => {
            // Check if URL is valid
            if (!isUrl(value)) {
                return 'TR_CUSTOM_BACKEND_INVALID_URL';
            }

            // Check if already exists
            if (currentUrls.find(url => url === value)) {
                return 'TR_CUSTOM_BACKEND_BACKEND_ALREADY_ADDED';
            }
        },
    });

    return {
        name,
        ref,
        error: errors[name],
        value: watch(name) || '',
        reset: () => setValue(name, ''),
    };
};

interface Props {
    network: Network;
    onCancel: () => void;
}

const CustomBlockbookUrls = ({ network, onCancel }: Props) => {
    const { symbol: coin } = network;
    const { setBackend } = useActions({
        setBackend: walletSettingsActions.setBackend,
    });

    const { translationString } = useTranslation();
    const defaults = useDefaultBackendSettings(coin);
    const initialValues = useInitialValues(coin);

    const [currentValues, setCurrentValues] = useState(initialValues);

    const input = useUrlInput(currentValues.urls);

    const changeType = (type: BackendValues['type']) => {
        setCurrentValues({
            type,
            urls: [],
        });
    };

    const addUrl = () => {
        setCurrentValues(({ type, urls }) => ({
            type,
            urls: [...urls, input.value],
        }));
        input.reset();
    };

    const removeUrl = (url: string) => {
        setCurrentValues(({ type, urls }) => ({
            type,
            urls: urls.filter(u => u !== url),
        }));
    };

    const reset = () => {
        setCurrentValues(initialValues);
    };

    const save = () => {
        const { type, urls } = currentValues;
        setBackend({
            coin,
            type: type === 'default' ? 'blockbook' : type,
            urls: type === 'default' ? [] : urls,
        });
        onCancel();
    };

    const editable = currentValues.type !== 'default';

    const changed =
        currentValues.type !== initialValues.type ||
        currentValues.urls.length !== initialValues.urls.length ||
        !!currentValues.urls.find((url, i) => url !== initialValues.urls[i]);

    const supportedBackends = getSupportedBackends(network);

    return (
        <Wrapper>
            <Heading>
                <Translation id="TR_BACKENDS" />
                <TooltipSymbol
                    content={
                        <TooltipContent>
                            <Translation id="SETTINGS_ADV_COIN_BLOCKBOOK_DESCRIPTION" />
                            <Translation
                                id="TR_DEFAULT_VALUE"
                                values={{
                                    value: defaults.urls.join(', ') ?? '',
                                }}
                            />
                        </TooltipContent>
                    }
                />
            </Heading>

            {!!supportedBackends.length && (
                <SelectBar
                    selectedOption={currentValues.type}
                    onChange={changeType}
                    options={[
                        { label: <Translation id="TR_DEFAULT" />, value: 'default' },
                        ...supportedBackends.map(be => ({ label: be, value: be })),
                    ]}
                />
            )}

            {(editable ? currentValues.urls : defaults.urls).map(url => (
                <Input
                    key={url}
                    value={url}
                    noTopLabel
                    isDisabled
                    noError
                    innerAddon={
                        editable ? (
                            <Button
                                variant="tertiary"
                                icon="CROSS"
                                onClick={() => removeUrl(url)}
                            />
                        ) : null
                    }
                />
            ))}

            {editable && (
                <Input
                    type="text"
                    noTopLabel
                    name={input.name}
                    data-test={`@settings/advance/${input.name}`}
                    placeholder={translationString('SETTINGS_ADV_COIN_URL_INPUT_PLACEHOLDER', {
                        url: getUrlPlaceholder(network, currentValues.type),
                    })}
                    innerRef={input.ref}
                    state={input.error ? 'error' : undefined}
                    bottomText={<InputError error={input.error} />}
                />
            )}

            <ButtonRow>
                {changed && (
                    <Button
                        variant="tertiary"
                        data-test="@settings/advance/button/reset"
                        onClick={reset}
                    >
                        <Translation id="TR_RESET" />
                    </Button>
                )}

                <ButtonConnectionInfo maxWidth={800} content={<ConnectionInfo coin={coin} />}>
                    <Button variant="tertiary">
                        <Translation id="SETTINGS_ADV_COIN_CONN_INFO_TITLE" />
                    </Button>
                </ButtonConnectionInfo>

                {editable && (
                    <Button
                        variant="tertiary"
                        icon="PLUS"
                        data-test="@settings/advance/button/add"
                        onClick={addUrl}
                        isDisabled={Boolean(input.error) || input.value === ''}
                    >
                        <Translation id="TR_ADD_NEW_BLOCKBOOK_BACKEND" />
                    </Button>
                )}
            </ButtonRow>

            <SaveButton variant="primary" onClick={save} isDisabled={!changed}>
                <Translation id="TR_CONFIRM" />
            </SaveButton>
        </Wrapper>
    );
};

export default CustomBlockbookUrls;

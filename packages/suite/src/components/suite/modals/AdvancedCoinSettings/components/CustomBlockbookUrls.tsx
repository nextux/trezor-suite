import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import TrezorConnect, { CoinInfo } from 'trezor-connect';
import { Input, Button, variables, Tooltip } from '@trezor/components';
import { Translation, TooltipSymbol } from '@suite-components';
import { isUrl } from '@suite-utils/validators';
import { useTranslation } from '@suite-hooks/useTranslation';
import InputError from '@wallet-components/InputError';
import * as walletSettingsActions from '@settings-actions/walletSettingsActions';
import { useActions, useSelector } from '@suite-hooks';
import ConnectionInfo from './ConnectionInfo';
import type { Network } from '@wallet-types';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    text-align: left;
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: flex-end;
    & > * + * {
        margin-left: 12px;
    }
`;

const Heading = styled.span`
    color: ${props => props.theme.TYPE_DARK_GREY};
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 6px;
`;

const TooltipContent = styled.div`
    display: flex;
    flex-direction: column;
`;

interface Props {
    coin: Network['symbol'];
}

type FormInputs = {
    url: string;
};

const useCoinInfo = (coin: Network['symbol']) => {
    const [coinInfo, setCoinInfo] = useState<CoinInfo>();
    useEffect(() => {
        TrezorConnect.getCoinInfo({ coin }).then(result => {
            if (result.success) {
                setCoinInfo(result.payload);
            }
        });
    }, [coin]);
    return coinInfo;
};

const CustomBlockbookUrls = ({ coin }: Props) => {
    const { addBlockbookUrl, removeBlockbookUrl } = useActions({
        addBlockbookUrl: walletSettingsActions.addBlockbookUrl,
        removeBlockbookUrl: walletSettingsActions.removeBlockbookUrl,
    });
    const { blockbookUrls } = useSelector(state => ({
        blockbookUrls: state.wallet.settings.blockbookUrls,
    }));
    const coinInfo = useCoinInfo(coin);

    const { register, getValues, setValue, watch, errors } = useForm<FormInputs>({
        mode: 'onChange',
    });
    const { translationString } = useTranslation();

    const inputName = 'url';
    const inputValue = getValues(inputName) || '';
    const error = errors[inputName];

    const addUrl = () => {
        addBlockbookUrl({
            coin,
            url: inputValue,
        });

        setValue(inputName, '');
    };

    const urls = blockbookUrls.filter(b => b.coin === coin);
    const watchAll = watch();

    return (
        <Wrapper>
            <Heading>
                <Translation id="SETTINGS_ADV_COIN_BLOCKBOOK_TITLE" />
                <TooltipSymbol
                    content={
                        <TooltipContent>
                            <Translation id="SETTINGS_ADV_COIN_BLOCKBOOK_DESCRIPTION" />
                            <Translation
                                id="TR_DEFAULT_VALUE"
                                values={{
                                    value: coinInfo?.blockchainLink?.url.join(', ') ?? '',
                                }}
                            />
                        </TooltipContent>
                    }
                />
            </Heading>

            {urls.map(b => (
                <Input
                    key={b.url}
                    value={b.url}
                    noTopLabel
                    isDisabled
                    noError
                    innerAddon={
                        <Button
                            variant="tertiary"
                            icon="CROSS"
                            onClick={() => removeBlockbookUrl(b)}
                        />
                    }
                />
            ))}

            <Input
                type="text"
                noTopLabel
                name={inputName}
                data-test={`@settings/advance/${inputName}`}
                placeholder={translationString('SETTINGS_ADV_COIN_URL_INPUT_PLACEHOLDER', {
                    url: `https://${coin}1.trezor.io/`,
                })}
                innerRef={register({
                    validate: (value: string) => {
                        // Check if URL is valid
                        if (!isUrl(value)) {
                            return 'TR_CUSTOM_BACKEND_INVALID_URL';
                        }

                        // Check if already exists
                        if (blockbookUrls.find(b => b.coin === coin && b.url === value)) {
                            return 'TR_CUSTOM_BACKEND_BACKEND_ALREADY_ADDED';
                        }
                    },
                })}
                state={error ? 'error' : undefined}
                bottomText={<InputError error={error} />}
            />

            <ButtonRow>
                <Tooltip maxWidth={800} content={<ConnectionInfo coin={coin} />}>
                    <Button variant="tertiary">
                        <Translation id="SETTINGS_ADV_COIN_CONN_INFO_TITLE" />
                    </Button>
                </Tooltip>

                {watchAll && (
                    <Button
                        variant="tertiary"
                        icon="PLUS"
                        data-test="@settings/advance/button/add"
                        onClick={addUrl}
                        isDisabled={Boolean(error) || inputValue === ''}
                    >
                        <Translation id="TR_ADD_NEW_BLOCKBOOK_BACKEND" />
                    </Button>
                )}
            </ButtonRow>
        </Wrapper>
    );
};

export default CustomBlockbookUrls;

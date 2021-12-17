import React from 'react';
import styled from 'styled-components';
import { CoinLogo } from '@trezor/components';
import { Modal } from '@suite-components';
import { NETWORKS } from '@wallet-config';
import { Network } from '@suite/types/wallet';
import CustomBlockbookUrls from './components/CustomBlockbookUrls';

const Section = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

interface Props {
    coin: Network['symbol'];
    onCancel: () => void;
}

const AdvancedCoinSettings = ({ coin, onCancel }: Props) => {
    const network = NETWORKS.find(n => n.symbol === coin);

    return network ? (
        <Modal
            cancelable
            onCancel={onCancel}
            heading={
                <>
                    <CoinLogo symbol={network.symbol} />
                    {network.name}
                </>
            }
        >
            {/* <AccountUnits /> */}
            <Section>
                <CustomBlockbookUrls network={network} onCancel={onCancel} />
            </Section>
            {/* <CustomExplorerUrl /> */}
        </Modal>
    ) : null;
};

export default AdvancedCoinSettings;

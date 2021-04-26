import React, {
    Dispatch,
    FC,
    memo,
    MutableRefObject,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from "react";
import { range, shuffle, uniqueId } from "lodash";
import { tween } from "tweening-js";
import browserBeep from "browser-beep";

import styles from "./InsertionSort.module.css";

type TSetIdx = Dispatch<SetStateAction<number>>;
type TSetX = Dispatch<SetStateAction<number>>;

const SIZE = 15;
const DURATION = 100;
const BAR_WIDTH = 20;
const BAR_MARGIN = 2;

const getArr = () => shuffle(range(1, SIZE + 1));
const initArr = range(1, SIZE + 1).map(() => 1);
const getX = (idx: number) => idx * (BAR_MARGIN + BAR_WIDTH);

interface IExtendeBar {
    value: number;
    refSetX: MutableRefObject<TSetX>;
}

const sort = async (
    extendeBarrArr: IExtendeBar[],
    setIdxI: TSetIdx,
    setIdxJ: TSetIdx
) => {
    const beepA = browserBeep({ frequency: 830 });
    const beepB = browserBeep({ frequency: 230 });

    let i = 1;
    let j = 1;
    while (i < extendeBarrArr.length) {
        await tween(j, i, setIdxJ, DURATION).promise();
        j = i;
        while (j > 0 && extendeBarrArr[j - 1].value > extendeBarrArr[j].value) {
            beepA(1);
            await Promise.all([
                tween(
                    getX(j),
                    getX(j - 1),
                    extendeBarrArr[j].refSetX.current,
                    DURATION
                ).promise(),
                tween(
                    getX(j - 1),
                    getX(j),
                    extendeBarrArr[j - 1].refSetX.current,
                    DURATION
                ).promise(),
            ]);

            let temp = extendeBarrArr[j - 1];
            extendeBarrArr[j - 1] = extendeBarrArr[j];
            extendeBarrArr[j] = temp;

            await tween(j, j - 1, setIdxJ, DURATION).promise();

            j--;
        }

        beepB(1);

        await tween(i, i + 1, setIdxI, DURATION).promise();
        i++;
    }
};

interface IPropsBar {
    value: number;
    idx: number;
    refSetX: MutableRefObject<TSetX>;
}

const Bar: FC<IPropsBar> = ({ value, idx, refSetX }) => {
    const [x, setX] = useState(getX(idx));
    const style = {
        height: value * 10,
        transform: `translateX(${x}px)`,
    };
    refSetX.current = setX;
    return <div style={style} className={styles.bar} />;
};

interface IPropBoard {
    arr: number[];
    refExtendedBarArr: MutableRefObject<IExtendeBar[]>;
}

const isArrEqual = (oldProps: IPropBoard, props: IPropBoard) => {
    return oldProps.arr === props.arr;
};

const Board: FC<IPropBoard> = ({ arr, refExtendedBarArr }) => {
    const extendedBarArr = arr.map((value) => ({
        value,
        refSetX: useRef<TSetX>(null),
    }));

    useEffect(() => {
        refExtendedBarArr.current = extendedBarArr;
    }, [arr]);

    return (
        <div className={styles.board}>
            {extendedBarArr.map((item, i) => {
                return (
                    <Bar
                        key={`${uniqueId("set")}:${i}`}
                        value={item.value}
                        idx={i}
                        refSetX={item.refSetX}
                    />
                );
            })}
        </div>
    );
};

const MemorizeBoard = memo(Board, isArrEqual);

const InsertionSort = () => {
    const [arr, setArr] = useState(initArr);
    const [idxI, setIdxI] = useState(1);
    const [idxJ, setIdxJ] = useState(1);
    const [isRunning, setIsRunning] = useState(false);
    const refExtendedBarArr = useRef<IExtendeBar[]>([]);

    useEffect(() => setArr(getArr()), []);

    const handleShuffle = () => {
        setArr(getArr());
        setIdxI(1);
        setIdxJ(1);
    };

    const handleSort = async () => {
        setIsRunning(true);
        await sort(refExtendedBarArr.current, setIdxI, setIdxJ);
        setIsRunning(false);
    };

    return (
        <div>
            <MemorizeBoard arr={arr} refExtendedBarArr={refExtendedBarArr} />
            <div
                className={`${styles.index} ${styles.blue}`}
                style={{ transform: `translateX(${getX(idxI)}px)` }}
            >
                i
            </div>
            <div
                className={`${styles.index} ${styles.yellow}`}
                style={{ transform: `translateX(${getX(idxJ)}px)` }}
            >
                j
            </div>
            <div className={styles.buttonBox}>
                {!isRunning && (
                    <button className={styles.button} onClick={handleShuffle}>
                        shuffle
                    </button>
                )}
                {!isRunning && (
                    <button className={styles.button} onClick={handleSort}>
                        sort
                    </button>
                )}
                {isRunning && <div className={styles.running}>Running...</div>}
            </div>
        </div>
    );
};

export default InsertionSort;

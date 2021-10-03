import React, { Component } from 'react';
import {
    Container,
    Row,
    Col,
    Alert,
    Button
} from "reactstrap";


import HelpImageDialog from './help/HelpDialog';
import {
    fixInterfaceNames,
    niceSize,
    hexAddr8,
    formatDFUSummary,
    getDFUDescriptorProperties,
    readFileData
} from './DFUtils';
import connectDialog from './img/connect_dialog.png';
import latestFW from './fw/jammy_e_latest.dfu';

import DFU from 'webdfu/DFU';
import DFUse from 'webdfu/DFUse';

class ConnectionCase extends Component {

    constructor(props) {
        super(props)
        this.state = {
            device: undefined,
            logs: [],
            logContext: null
        };
        this.autoConnect = this.autoConnect.bind(this);

        this.detachJammyDFU = this.detachJammyDFU.bind(this);
        this.connectToJammyDFU = this.connectToJammyDFU.bind(this);
        this.flashJammyEOverDFU = this.flashJammyEOverDFU.bind(this);
    }

    // Current log div element to append to
    setLogContext = (div) => {
        this.setState({ logContext: div });
    };

    // clearLog(context) {
    //     if (typeof context === 'undefined') {
    //         context = this.state.logContext;
    //     }
    //     if (context) {
    //         context.innerHTML = "";
    //     }
    // }

    logDebug(msg) {
        let newLogs = this.state.logs;
        newLogs.push("D: " + msg);
        this.setState({
            logs: newLogs
        })
    }

    logInfo(msg) {
        let newLogs = this.state.logs;
        newLogs.push("I: " + msg);
        this.setState({
            logs: newLogs
        })
    }

    logWarning(msg) {
        let newLogs = this.state.logs;
        newLogs.push("W: " + msg);
        this.setState({
            logs: newLogs
        })
    }

    logError(msg) {
        let newLogs = this.state.logs;
        newLogs.push("E: " + msg);
        this.setState({
            logs: newLogs
        })
    }

    detachJammyDFU() {
        if (this.state.device) {
            this.state.device.detach().then(
                async len => {
                    let detached = false;
                    try {
                        await this.state.device.close();
                        await this.state.device.waitDisconnected(5000);
                        detached = true;
                    } catch (err) {
                        console.log("Detach failed: " + err);
                    }

                    this.onDisconnect();
                    this.setState({
                        device: undefined
                    })
                    if (detached) {
                        // Wait a few seconds and try reconnecting
                        setTimeout(this.autoConnect, 5000);
                    }
                },
                async error => {
                    await this.state.device.close();
                    this.onDisconnect(error);
                    this.setState({
                        device: undefined
                    })
                }
            );
        }
    }

    connectToJammyDFU() {
        console.log("Connect ot Jammy DFU!");
        navigator.usb.requestDevice({ filters: [] }).then(
            async selectedDevice => {
                let interfaces = DFU.findDeviceDfuInterfaces(selectedDevice);
                if (interfaces.length === 0) {
                    console.log("Nothing selected");
                    // statusDisplay.textContent = "The selected device does not have any USB DFU interfaces.";
                } else if (interfaces.length === 1) {
                    await fixInterfaceNames(selectedDevice, interfaces);
                    console.log("Selected device: ", selectedDevice, interfaces[0])
                    this.setState({
                        device: await this.connect(new DFU.Device(selectedDevice, interfaces[0]))
                    })
                } else {
                    await fixInterfaceNames(selectedDevice, interfaces);
                    console.log("Connected devices: ", selectedDevice, interfaces[0])
                    // populateInterfaceList(interfaceForm, selectedDevice, interfaces);
                    // async function connectToSelectedInterface() {
                    //     interfaceForm.removeEventListener('submit', this);
                    //     const index = interfaceForm.elements["interfaceIndex"].value;
                    //     device = await connect(new dfu.Device(selectedDevice, interfaces[index]));
                    // }

                    // interfaceForm.addEventListener('submit', connectToSelectedInterface);

                    // interfaceDialog.addEventListener('cancel', function () {
                    //     interfaceDialog.removeEventListener('cancel', this);
                    //     interfaceForm.removeEventListener('submit', connectToSelectedInterface);
                    // });

                    // interfaceDialog.showModal();
                }
            }
        ).catch(error => {
            // statusDisplay.textContent = error;
        });
    }

    async flashJammyEOverDFU() {
        console.log("Latest FW: ", latestFW);
        if (this.state.device) {
            this.state.device.startAddress = 0x0800f000;
            // setLogContext(downloadLog);
            // clearLog(downloadLog);
            try {
                let status = await this.state.device.getStatus();
                if (status.state === DFU.dfuERROR) {
                    await this.state.device.clearStatus();
                }
            } catch (error) {
                this.logWarning("Failed to clear status");
                console.log("Failed to clear status", error)
            }
            let data = await readFileData(latestFW)
            let reader = new FileReader();
            reader.state = this.state;
            reader.component = this;
            reader.onload = async function () {
                let firmwareFile = reader.result;
                await this.state.device.do_download(this.state.transferSize, firmwareFile, this.state.manifestationTolerant).then(
                    () => {
                        this.component.logInfo("Done!");
                        this.component.setLogContext(null);
                        if (!this.state.manifestationTolerant) {
                            this.state.device.waitDisconnected(5000).then(
                                dev => {
                                    this.onDisconnect();
                                    this.setState({
                                        device: undefined
                                    })
                                },
                                error => {
                                    // It didn't reset and disconnect for some reason...
                                    console.log("Device unexpectedly tolerated manifestation.");
                                }
                            );
                        }
                    },
                    error => {
                        console.log("Error: ", error)
                        this.component.logError(error);
                        this.component.setLogContext(null);
                    }
                )
            }
            reader.readAsArrayBuffer(data);
        }
    }

    onDisconnect(reason) {
        // if (reason) {
        //     statusDisplay.textContent = reason;
        // }

        // connectButton.textContent = "Connect";
        // infoDisplay.textContent = "";
        // dfuDisplay.textContent = "";
        // detachButton.disabled = true;
        // downloadButton.disabled = true;
    }

    async connect(device) {
        try {
            await device.open();
        } catch (error) {
            this.onDisconnect(error);
            throw error;
        }

        // Attempt to parse the DFU functional descriptor
        let desc = {};
        try {
            desc = await getDFUDescriptorProperties(device);
        } catch (error) {
            this.onDisconnect(error);
            throw error;
        }

        let memorySummary = "";
        if (desc && Object.keys(desc).length > 0) {
            device.properties = desc;
            //transferSizeField.value = desc.TransferSize;
            this.state.transferSize = desc.TransferSize;
            if (desc.CanDnload) {
                this.state.manifestationTolerant = desc.ManifestationTolerant;
            }

            if (device.settings.alternate.interfaceProtocol === 0x02) {
                if (!desc.CanUpload) {
                    //DFUseUploadSizeField.disabled = true;
                }
                if (!desc.CanDnload) {
                    //dnloadButton.disabled = true;
                }
            }

            if (desc.DFUVersion === 0x011a && device.settings.alternate.interfaceProtocol === 0x02) {
                if(!device.settings.name){
                    // device.settings.name = "Jammy E DFU"
                    let interfaces = DFU.findDeviceDfuInterfaces(device.device_);
                    await fixInterfaceNames(device.device_, interfaces);
                    device.settings.name = interfaces[0].name;
                    console.log("Name: ", interfaces.name);
                } 
                device = new DFUse.Device(device.device_, device.settings);
                if (device.memoryInfo) {
                    let totalSize = 0;
                    for (let segment of device.memoryInfo.segments) {
                        totalSize += segment.end - segment.start;
                    }
                    memorySummary = `Selected memory region: ${device.memoryInfo.name} (${niceSize(totalSize)})`;
                    for (let segment of device.memoryInfo.segments) {
                        let properties = [];
                        if (segment.readable) {
                            properties.push("readable");
                        }
                        if (segment.erasable) {
                            properties.push("erasable");
                        }
                        if (segment.writable) {
                            properties.push("writable");
                        }
                        let propertySummary = properties.join(", ");
                        if (!propertySummary) {
                            propertySummary = "inaccessible";
                        }

                        memorySummary += `\n${hexAddr8(segment.start)}-${hexAddr8(segment.end - 1)} (${propertySummary})`;
                    }
                }
            } else {
                console.log("Wrong DFUVersion: ", desc.DFUVersion)
            }
        }

        // Bind logging methods
        device.logDebug = this.logDebug;
        device.logInfo = this.logDebug; //logInfo;
        device.logWarning = this.logDebug; //logWarning;
        device.logError = this.logDebug; //logError;
        device.logProgress = this.logDebug; //logProgress;

        // Clear logs
        // clearLog(uploadLog);
        // clearLog(downloadLog);

        // Display basic USB information
        // statusDisplay.textContent = '';
        // connectButton.textContent = 'Disconnect';

        // Display basic dfu-util style info
        console.log("DFU Summary: ", formatDFUSummary(device));

        // Update buttons based on capabilities
        if (device.settings.alternate.interfaceProtocol === 0x01) {
            // Runtime
            // detachButton.disabled = false;
            // downloadButton.disabled = true;
        } else {
            // DFU
            // detachButton.disabled = true;
            // downloadButton.disabled = false;
        }

        return device;
    }

    autoConnect(vid, serial) {
        console.log("State: ", this.state);
        console.log("DFU: ", this.state.dfu);

        DFU.findAllDfuInterfaces().then(
            async dfu_devices => {
                console.log("Auto connection")
                let matching_devices = [];
                for (let dfu_device of dfu_devices) {
                    if (serial) {
                        if (dfu_device.device_.serialNumber === serial) {
                            matching_devices.push(dfu_device);
                        }
                    } else if (dfu_device.device_.vendorId === vid) {
                        matching_devices.push(dfu_device);
                    } else {
                        console.log("Unmatched device: ", dfu_device)
                    }
                }

                if (matching_devices.length === 0) {
                    console.log("Nothing selected");
                    // statusDisplay.textContent = 'No device found.';
                } else {
                    if (matching_devices.length === 1) {
                        console.log("Selected device: ", matching_devices[0])
                        //statusDisplay.textContent = 'Connecting...';
                        let device = matching_devices[0];
                        console.log(device);
                        this.setState({
                            device: await this.connect(device)
                        })
                    } else {
                        console.log("Connected devices: ", matching_devices)
                        // statusDisplay.textContent = "Multiple DFU interfaces found.";
                    }
                    vid = matching_devices[0].device_.vendorId;
                }
            }
        );
    }

    componentDidMount() {
        let productId = 1155;
        this.autoConnect(productId, "");
    }

    render() {
        return (
            <div>
                <Container fluid="sm">
                    <Row>
                        <Col>
                            <Alert color="success">
                                Connecting to Jammy E...
                            </Alert>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Alert color="danger">
                                Do not disconnect Jammy E!
                            </Alert>
                        </Col>
                    </Row>
                    {
                        (this.state.device === undefined) && (
                            <Row>
                                <Col>
                                    <Button color='success' size='sm' onClick={this.connectToJammyDFU}>
                                        Connect to Jammy E
                                    </Button>
                                </Col>
                                <Col>
                                    <HelpImageDialog title='How to connect?' image={connectDialog} />
                                </Col>
                            </Row>
                        )
                    }
                    {
                        (this.state.device !== undefined) && (
                            <Row>
                                <Col>
                                    <Button color='success' size='sm' onClick={this.flashJammyEOverDFU}>
                                        Flash Jammy E: {this.state.device.device_.serialNumber}
                                    </Button>
                                </Col>
                                <Col>
                                    <Button color='success' size='sm' onClick={this.detachJammyDFU}>
                                        Detach
                                    </Button>
                                </Col>
                            </Row>
                        )
                    }
                    {
                        this.state.logs.map(log =>
                            <Row key={log}>
                                <Col>
                                    <Alert color="danger">
                                        {log}
                                    </Alert>
                                </Col>
                            </Row>
                        )
                    }
                </Container>
            </div>
        );
    }
}

export { ConnectionCase }
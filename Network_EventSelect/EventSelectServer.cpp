#include "EventSelectServer.h"

EventSelectSocket::EventSelectSocket()
	:sockTotal(0)
{
	ZeroMemory(&servAddr, sizeof(SOCKADDR_IN));
}

EventSelectSocket::~EventSelectSocket()
{
	WSACleanup();
}

EventSelectSocketError::type EventSelectSocket::StartedEventSelect(USHORT servicePort)
{
	if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) { return EventSelectSocketError::STARTUP_FAILED; }

	hServSock = socket(PF_INET, SOCK_STREAM, 0);
	if (hServSock == INVALID_SOCKET) { return EventSelectSocketError::CREATED_SOCKET_FAILED; }

	servAddr.sin_family = AF_INET;
	servAddr.sin_addr.s_addr = htonl(INADDR_ANY);
	servAddr.sin_port = servicePort;

	if (bind(hServSock, (struct sockaddr *)&servAddr, sizeof(servAddr)) == SOCKET_ERROR)
	{
		return EventSelectSocketError::SOCKET_BIND_FAILED;
	}

	WSAEVENT newEvent = WSACreateEvent();
	if (WSAEventSelect(hServSock, newEvent, FD_ACCEPT) == SOCKET_ERROR) { return EventSelectSocketError::EVEENT_SELECT_ACCEPT_FAILED; }

	if (listen(hServSock, 5) == SOCKET_ERROR) { return EventSelectSocketError::SOCKET_LISTEN_FAILED; }

	hSockArray[sockTotal] = hServSock;
	hEventArray[sockTotal] = newEvent;

	++sockTotal;

	return EventSelectSocketError::EVEENT_SELECT_SUCCESS;
}

bool EventSelectSocket::AriseFromMultipleEvents()
{
	// Event �� �߻��� ������ �ϴ� ���.
	int eventIndex = WSAWaitForMultipleEvents(sockTotal, hEventArray, FALSE, WSA_INFINITE, FALSE);
	eventIndex -= WSA_WAIT_EVENT_0;

	// event �� ���� �߻��ϸ� ���� ���� �����ϹǷ� �����ϸ鼭 � �̺�Ʈ�� ���� �߻��ߴ��� Ȯ���� �ʿ��ϴ�.
	for (int i = eventIndex; i < sockTotal; ++i)
	{
		int eventResult = WSAWaitForMultipleEvents(1, &hEventArray[i], TRUE, 0, FALSE);
		if (eventResult == WSA_WAIT_FAILED || eventResult == WSA_WAIT_TIMEOUT)
		{
			continue;
		}
		else
		{
			WSANETWORKEVENTS	netEvents;
			WSAEnumNetworkEvents(hSockArray[i], hEventArray[i], &netEvents);

			if (netEvents.lNetworkEvents & FD_ACCEPT)
			{
				if (netEvents.iErrorCode[FD_ACCEPT_BIT] != 0) { break; }

				this->AcceptEvent(i);
			}

			if (netEvents.lNetworkEvents & FD_READ)
			{
				if (netEvents.iErrorCode[FD_READ_BIT] != 0) { break; }

				this->ReadEvent(i);
			}

			if (netEvents.lNetworkEvents & FD_CLOSE)
			{
				if (netEvents.iErrorCode[FD_CLOSE_BIT] != 0) { break; }

				this->CloseEvent(i);
			}
		}
	}

	return true;
}

void EventSelectSocket::AcceptEvent(int iSockIndex)
{
	SOCKADDR_IN		cliAddr;

	int cliLen = sizeof(cliAddr);
	SOCKET hCliSock = accept(hSockArray[iSockIndex], (SOCKADDR*)&cliAddr, &cliLen);

	WSAEVENT newEvent = WSACreateEvent();
	WSAEventSelect(hCliSock, newEvent, FD_READ | FD_CLOSE);

	hEventArray[sockTotal] = newEvent;
	hSockArray[sockTotal] = hCliSock;

	++sockTotal;
}

void EventSelectSocket::ReadEvent(int iSockIndex)
{
	// echo server : send -> recv
	char message[BUFSIZE] = { 0, };
	int istrLen = recv(hSockArray[iSockIndex - WSA_WAIT_EVENT_0], message, sizeof(message), 0);

	send(hSockArray[iSockIndex - WSA_WAIT_EVENT_0], message, istrLen, 0);
}

void EventSelectSocket::CloseEvent(int iSockIndex)
{
	WSACloseEvent(hEventArray[iSockIndex]);
	closesocket(hSockArray[iSockIndex]);

	--sockTotal;

	// �ϳ��� ������ ���� �Ǿ����Ƿ� �迭�̹Ƿ� ������ �ʿ��ϴ�.
	for (int i = iSockIndex; i < sockTotal; ++i)
	{
		hSockArray[i] = hSockArray[i + 1];
		hEventArray[i] = hEventArray[i + 1];
	}
}

#pragma once
#include <WinSock2.h>
#pragma comment(lib,"ws2_32.lib") 

#define BUFSIZE 1024

struct EventSelectSocketError
{
	enum type
	{
		EVEENT_SELECT_SUCCESS = 0,
		STARTUP_FAILED,
		CREATED_SOCKET_FAILED,
		SOCKET_BIND_FAILED,
		EVEENT_SELECT_ACCEPT_FAILED,
		SOCKET_LISTEN_FAILED,

	};
};

class EventSelectSocket
{
private:
	WSADATA			wsaData;
	SOCKET			hServSock;
	SOCKADDR_IN		servAddr;

	int				sockTotal;
	SOCKET			hSockArray[WSA_MAXIMUM_WAIT_EVENTS];
	WSAEVENT		hEventArray[WSA_MAXIMUM_WAIT_EVENTS];

public:
	EventSelectSocket();
	~EventSelectSocket();

	EventSelectSocketError::type StartedEventSelect(USHORT servicePort);
	bool AriseFromMultipleEvents();

private:
	void AcceptEvent(int iSockIndex);
	void ReadEvent(int iSockIndex);
	void CloseEvent(int iSockIndex);
};
